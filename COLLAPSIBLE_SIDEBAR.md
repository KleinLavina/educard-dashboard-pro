# Collapsible Admin Sidebar

## ✅ Enhanced Navigation with Expand/Collapse

The Admin sidebar now has **collapsible sections** to organize Principal and Registrar functions separately!

---

## Admin Sidebar Structure

### When Expanded:

```
┌─────────────────────────┐
│ [Logo]                  │
├─────────────────────────┤
│ 🏫 Admin                │
│ Principal / Registrar   │
│ St. Mary's Academy      │
├─────────────────────────┤
│ 📊 Dashboard            │
├─────────────────────────┤
│ 🏫 Principal ▼          │
│   └─ 👥 All Students    │
│   └─ 📅 Attendance      │
│   └─ 🎓 Grades          │
├─────────────────────────┤
│ 📝 Registrar ▼          │
│   └─ 🆔 ID Cards        │
│   └─ ➕ Enrollment      │
├─────────────────────────┤
│ TOOLS                   │
│ 🔔 Alerts               │
│ ⚙️ Settings             │
├─────────────────────────┤
│ 🏠 Switch Role          │
└─────────────────────────┘
```

### When Collapsed:

```
┌────┐
│ 🏫 │ ← Admin indicator
├────┤
│ 📊 │ ← Dashboard
├────┤
│ 🏫 │ ← Principal (collapsed)
├────┤
│ 📝 │ ← Registrar (collapsed)
├────┤
│ 🔔 │ ← Alerts
│ ⚙️ │ ← Settings
├────┤
│ 🏠 │ ← Switch Role
└────┘
```

---

## Features

### 1. **Collapsible Sections**
- ✅ **Principal Section** - Can expand/collapse
  - School icon (🏫)
  - Contains: All Students, Attendance, Grades
  
- ✅ **Registrar Section** - Can expand/collapse
  - FileEdit icon (📝)
  - Contains: ID Cards, Enrollment

### 2. **Always Visible**
- ✅ **Dashboard** - Quick access, always shown
- ✅ **Tools** - Alerts and Settings always accessible

### 3. **Interactive**
- ✅ Click section header to expand/collapse
- ✅ Chevron icon rotates to indicate state
- ✅ Smooth animation transitions
- ✅ State persists during session

### 4. **Visual Indicators**
- ✅ Section icons (School for Principal, FileEdit for Registrar)
- ✅ Chevron down (▼) when expanded
- ✅ Chevron right (▶) when collapsed
- ✅ Hover effects on section headers

---

## Navigation Breakdown

### Dashboard (Always Visible)
- **Icon:** LayoutDashboard (📊)
- **Link:** `/dashboard`
- **Purpose:** Quick access to main admin dashboard

### Principal Section (Collapsible)
**Header:** 🏫 Principal

**Items:**
1. **All Students** (👥)
   - Link: `/students`
   - View: Full roster with analytics
   
2. **Attendance** (📅)
   - Link: `/attendance`
   - View: SF2 compliance tracking
   
3. **Grades** (🎓)
   - Link: `/grades`
   - View: Academic performance oversight

### Registrar Section (Collapsible)
**Header:** 📝 Registrar

**Items:**
1. **ID Cards** (🆔)
   - Link: `/id-cards`
   - View: Print/reprint management
   
2. **Enrollment** (➕)
   - Link: `/students`
   - View: Student registration

### Tools (Always Visible)
1. **Alerts** (🔔)
   - Link: `/alerts`
   - View: Notifications and alerts
   
2. **Settings** (⚙️)
   - Link: `/settings`
   - View: System configuration

---

## Benefits

### 1. **Clear Organization**
- Principal functions grouped together
- Registrar functions grouped together
- Easy to understand role separation

### 2. **Space Efficient**
- Collapse sections you don't need
- More room for other navigation items
- Cleaner sidebar appearance

### 3. **Better UX**
- Visual hierarchy with sections
- Icons help identify function areas
- Tooltips when sidebar is collapsed

### 4. **Flexible**
- Expand both sections for full access
- Collapse one to focus on the other
- Customize your workflow

---

## Comparison: Teacher vs Admin Sidebar

### Teacher Sidebar (Simple)
```
Main
├─ Dashboard
├─ My Students
├─ Attendance
└─ Grades

Tools
├─ ID Cards
├─ Alerts
└─ Settings
```

### Admin Sidebar (Organized)
```
Dashboard (standalone)

Principal ▼
├─ All Students
├─ Attendance
└─ Grades

Registrar ▼
├─ ID Cards
└─ Enrollment

Tools
├─ Alerts
└─ Settings
```

---

## Technical Implementation

### Components Used:
- ✅ `Collapsible` - Radix UI collapsible component
- ✅ `CollapsibleTrigger` - Clickable header
- ✅ `CollapsibleContent` - Expandable content
- ✅ `useState` - Track open/closed state
- ✅ `ChevronDown` - Animated indicator icon

### State Management:
```typescript
const [principalOpen, setPrincipalOpen] = useState(true);
const [registrarOpen, setRegistrarOpen] = useState(true);
```

Both sections start **expanded** by default for full visibility.

---

## User Interactions

### Expand/Collapse Section:
1. Click on "Principal" or "Registrar" header
2. Section smoothly expands or collapses
3. Chevron icon rotates to indicate state
4. Other sections remain unaffected

### Navigate to Page:
1. Click on any menu item
2. Page loads with active indicator
3. Sidebar remains in same state
4. Active page highlighted

### Collapse Entire Sidebar:
1. Click collapse button (if available)
2. Sidebar shrinks to icon-only mode
3. Tooltips show on hover
4. Role indicator card still visible

---

## Files Modified

1. ✅ `src/components/app-sidebar.tsx`
   - Added `useState` for collapsible state
   - Added `Collapsible` components
   - Organized admin navigation into sections
   - Added section icons and chevrons

---

## Visual States

### Both Sections Expanded (Default)
```
Dashboard
Principal ▼
  All Students
  Attendance
  Grades
Registrar ▼
  ID Cards
  Enrollment
Tools...
```

### Principal Collapsed
```
Dashboard
Principal ▶
Registrar ▼
  ID Cards
  Enrollment
Tools...
```

### Both Collapsed
```
Dashboard
Principal ▶
Registrar ▶
Tools...
```

---

## Accessibility

- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Clear visual indicators
- ✅ Hover states
- ✅ Focus states
- ✅ ARIA labels from Radix UI

---

## Conclusion

The Admin sidebar now has:
- ✅ **Clear organization** with Principal and Registrar sections
- ✅ **Collapsible sections** for better space management
- ✅ **Visual hierarchy** with icons and labels
- ✅ **Flexible workflow** - expand what you need
- ✅ **Professional appearance** - organized and clean

**The sidebar clearly shows that Admin has access to BOTH Principal AND Registrar functions!** 🎉
