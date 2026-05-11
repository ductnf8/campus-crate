

## Plan: Beautify Filter Panel & Remove Duplicate "Đăng bán" Button

### 1. FilterPanel - UI Enhancement
- Add clear placeholder text: "Chọn Tỉnh/Thành phố", "Chọn Quận/Huyện", "Chọn Phường/Xã"
- Add individual labels above each dropdown (not just one "Địa điểm" label)
- Add subtle dividers between location and price sections
- Improve styling with better spacing, icons per field, and a polished card look

### 2. Navbar - Remove Duplicate "Đăng bán"
- Remove the standalone "Đăng bán" button (lines 94-98) next to the profile dropdown on desktop
- Keep "Đăng bán" only in the top nav links (line 46), which is already there

### Files to edit:
- `src/components/FilterPanel.tsx` — UI polish with labeled dropdowns and better placeholders
- `src/components/layout/Navbar.tsx` — Remove duplicate "Đăng bán" button (lines 94-98)

