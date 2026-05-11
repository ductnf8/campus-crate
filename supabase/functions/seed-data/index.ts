import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const users = [
    { email: "minh@hust.edu.vn", name: "Nguyễn Văn Minh", university: "ĐH Bách Khoa Hà Nội", phone: "0901234567" },
    { email: "linh@ueh.edu.vn", name: "Trần Thị Linh", university: "ĐH Kinh tế TP.HCM", phone: "0912345678" },
    { email: "duc@fpt.edu.vn", name: "Phạm Hoàng Đức", university: "ĐH FPT", phone: "0923456789" },
    { email: "hoa@hmu.edu.vn", name: "Lê Thị Hoa", university: "ĐH Y Hà Nội", phone: "0934567890" },
    { email: "nam@uit.edu.vn", name: "Võ Quốc Nam", university: "ĐH CNTT TP.HCM", phone: "0945678901" },
  ];

  const userIds: string[] = [];
  const upsertProfile = async (id: string, u: { email: string; name: string; university: string; phone: string }) => {
    await supabaseAdmin.from("profiles").upsert({
      id,
      email: u.email,
      name: u.name,
      university: u.university,
      phone: u.phone,
      avatar_url: `https://i.pravatar.cc/150?u=${u.email}`,
    });
  };

  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: "Password123!",
      email_confirm: true,
      user_metadata: { name: u.name },
    });
    if (error && error.message?.includes("already been registered")) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((x: any) => x.email === u.email);
      if (existing) {
        userIds.push(existing.id);
        await upsertProfile(existing.id, u);
      }
      continue;
    }
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }
    userIds.push(data.user.id);
    await upsertProfile(data.user.id, u);
  }

  if (userIds.length < 5) {
    return new Response(JSON.stringify({ error: "Not all users created", userIds }), { status: 400, headers: corsHeaders });
  }

  const items = [
    { title: "MacBook Air M1 2020 - Còn bảo hành", description: "MacBook Air M1 8GB/256GB, pin cycle 120, còn bảo hành Apple đến tháng 6/2026. Máy đẹp 98%, full phụ kiện.", price: 15500000, image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", location: "Hà Nội", category: "Điện tử", is_featured: true, views_count: 234, user_id: userIds[0] },
    { title: "Sách Giải tích 1 + 2 (bộ)", description: "Bộ sách Giải tích 1 và 2, tác giả Nguyễn Đình Trí. Sách còn mới 90%, không viết vẽ.", price: 120000, image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600", location: "Hà Nội", category: "Sách vở", is_featured: false, views_count: 45, user_id: userIds[0] },
    { title: "Áo khoác Uniqlo size M", description: "Áo khoác lông cừu Uniqlo, mặc 2 lần, size M. Lý do bán: mua nhầm size.", price: 350000, image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", location: "TP. Hồ Chí Minh", category: "Quần áo", is_featured: false, views_count: 89, user_id: userIds[1] },
    { title: "iPad Air 5 WiFi 64GB", description: "iPad Air 5 chip M1, màu Starlight, fullbox. Dùng 6 tháng, màn hình không trầy xước.", price: 9800000, image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600", location: "TP. Hồ Chí Minh", category: "Điện tử", is_featured: true, views_count: 312, user_id: userIds[1] },
    { title: "Xe đạp Giant ATX 830 2023", description: "Xe đạp thể thao Giant ATX 830, đi được 500km, còn bảo hành khung. Tặng kèm khóa + đèn.", price: 4200000, image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600", location: "Đà Nẵng", category: "Xe cộ", is_featured: true, views_count: 178, user_id: userIds[2] },
    { title: "Bàn phím cơ Akko 3068B Plus", description: "Bàn phím cơ Akko 3068B Plus, switch CS Jelly Pink, keycap PBT. Dùng 3 tháng.", price: 890000, image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", location: "Hà Nội", category: "Điện tử", is_featured: false, views_count: 156, user_id: userIds[2] },
    { title: "Bộ dụng cụ nấu ăn cho SV", description: "Bộ nồi chảo + dao thớt, phù hợp phòng trọ sinh viên. Mới dùng 1 tháng, chuyển KTX nên bán.", price: 280000, image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", location: "Cần Thơ", category: "Đồ gia dụng", is_featured: false, views_count: 67, user_id: userIds[3] },
    { title: "Vợt cầu lông Yonex Astrox 88D", description: "Vợt cầu lông Yonex Astrox 88D Pro, căng cước BG65, tặng kèm bao vợt.", price: 1500000, image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600", location: "Hà Nội", category: "Đồ thể thao", is_featured: false, views_count: 93, user_id: userIds[3] },
    { title: "Tai nghe Sony WH-1000XM4", description: "Tai nghe chống ồn Sony WH-1000XM4, pin 30h, đã thay đệm tai mới. Âm thanh tuyệt vời.", price: 3200000, image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600", location: "TP. Hồ Chí Minh", category: "Điện tử", is_featured: true, views_count: 445, user_id: userIds[4] },
    { title: "Balo laptop Tomtoc 15.6 inch", description: "Balo laptop Tomtoc chống sốc, ngăn laptop 15.6 inch, chống nước nhẹ. Dùng 2 tháng.", price: 450000, image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", location: "Đà Nẵng", category: "Phụ kiện", is_featured: false, views_count: 78, user_id: userIds[4] },
    { title: "Đèn bàn LED Xiaomi", description: "Đèn bàn Xiaomi Mi LED, 3 chế độ ánh sáng, sạc USB-C. Mới 99%.", price: 180000, image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", location: "Nha Trang", category: "Đồ gia dụng", is_featured: false, views_count: 34, user_id: userIds[2] },
    { title: "Giày Nike Air Force 1 size 42", description: "Giày Nike AF1 trắng, size 42, mang 5 lần. Bán vì không hợp chân.", price: 950000, image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", location: "Huế", category: "Quần áo", is_featured: false, views_count: 201, user_id: userIds[3] },
  ];

  const { error: itemsError } = await supabaseAdmin.from("items").insert(items);
  if (itemsError) {
    return new Response(JSON.stringify({ error: itemsError.message }), { status: 400, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true, userIds }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
