import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-functions-apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Bạn là trợ lý AI của StuMarket - sàn mua bán đồ cũ cho sinh viên.

QUY TẮC:
- Trả lời tiếng Việt, ngắn gọn, thân thiện.
- Khi người dùng hỏi về SẢN PHẨM (ví dụ: "tìm laptop gần FPT Hà Nội", "có sách giáo trình nào không", "đồ ở Cầu Giấy giá dưới 500k"), BẮT BUỘC gọi tool "search_products" để tìm. Tự rút trích từ khóa, địa điểm (ví dụ FPT Hà Nội -> location: "Hà Nội" hoặc "Cầu Giấy"), và giá tối đa.
- Sau khi có kết quả, hãy liệt kê dạng markdown có LINK clickable theo format: \`- [Tên sản phẩm](/item/<id>) — giá — địa điểm\`. Mỗi sản phẩm 1 dòng, tối đa 5 dòng.
- Nếu không có kết quả, gợi ý người dùng đổi từ khóa.
- Ngoài ra có thể tư vấn mẹo mua bán, định giá, an toàn giao dịch.`;

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Tìm kiếm sản phẩm đang bán trên StuMarket theo từ khóa, địa điểm hoặc giá tối đa.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Từ khóa tìm kiếm (tên sản phẩm, danh mục)" },
          location: { type: "string", description: "Địa điểm: tỉnh/thành/quận/huyện/phường, ví dụ Hà Nội, Cầu Giấy" },
          max_price: { type: "number", description: "Giá tối đa (VND)" },
          limit: { type: "number", description: "Số lượng tối đa, mặc định 6" },
        },
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const AI_API_URL = Deno.env.get("AI_API_URL") || "https://openrouter.ai/api/v1/chat/completions";
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    const AI_MODEL = Deno.env.get("AI_MODEL") || "google/gemini-2.5-flash";
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const convo: unknown[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

    for (let i = 0; i < 3; i++) {
      const r = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: convo,
          tools,
          stream: false,
        }),
      });

      if (!r.ok) {
        if (r.status === 429) {
          return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, thử lại sau." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (r.status === 402) {
          return new Response(JSON.stringify({ error: "Hết quota AI, vui lòng liên hệ admin." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await r.text();
        console.error("AI error:", r.status, t);
        return new Response(JSON.stringify({ error: "Lỗi AI" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await r.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) break;

      const toolCalls = msg.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        convo.push(msg);
        for (const tc of toolCalls) {
          if (tc.function?.name === "search_products") {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.function.arguments || "{}");
            } catch { /* ignore */ }
            const { data: items, error } = await supabase.rpc("search_items_for_ai", {
              _q: args.query || null,
              _location: args.location || null,
              _max_price: args.max_price || null,
              _limit: args.limit || 6,
            });
            convo.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify(error ? { error: error.message } : (items || [])),
            });
          }
        }
        continue;
      }

      return new Response(JSON.stringify({ content: msg.content || "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: "Xin lỗi, mình chưa trả lời được. Thử lại nhé!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
