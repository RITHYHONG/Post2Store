export interface CategoryMeta {
  id: string;
  label: string;
  khmer?: string;
  emoji: string;
  badgeClass: string;
  bgLight: string;
}

export const CATEGORIES_CONFIG: Record<string, CategoryMeta> = {
  "All": {
    id: "All",
    label: "All Items",
    khmer: "ទាំងអស់",
    emoji: "✨",
    badgeClass: "bg-zinc-900 text-white border-zinc-900",
    bgLight: "bg-zinc-100 text-zinc-800 border-zinc-200",
  },
  "Biscuits, Chips & Snacks": {
    id: "Biscuits, Chips & Snacks",
    label: "Biscuits & Snacks",
    khmer: "នំ និង ចំណីស្រួយ",
    emoji: "🍪",
    badgeClass: "bg-amber-500 text-white border-amber-600",
    bgLight: "bg-amber-50 text-amber-800 border-amber-200",
  },
  "Beverages & Drinks": {
    id: "Beverages & Drinks",
    label: "Drinks & Beverages",
    khmer: "ភេសជ្ជៈ",
    emoji: "🧃",
    badgeClass: "bg-sky-500 text-white border-sky-600",
    bgLight: "bg-sky-50 text-sky-800 border-sky-200",
  },
  "Candy, Chocolate & Jelly": {
    id: "Candy, Chocolate & Jelly",
    label: "Candy & Chocolate",
    khmer: "ស្ករគ្រាប់ និង សូកូឡា",
    emoji: "🍬",
    badgeClass: "bg-pink-500 text-white border-pink-600",
    bgLight: "bg-pink-50 text-pink-800 border-pink-200",
  },
  "Instant Noodles & Meals": {
    id: "Instant Noodles & Meals",
    label: "Instant Meals",
    khmer: "មី និង អាហារកំប៉ុង",
    emoji: "🍜",
    badgeClass: "bg-orange-500 text-white border-orange-600",
    bgLight: "bg-orange-50 text-orange-800 border-orange-200",
  },
  "Dried Fruits, Nuts & Cereals": {
    id: "Dried Fruits, Nuts & Cereals",
    label: "Fruits & Nuts",
    khmer: "ដំណាប់ និង គ្រាប់",
    emoji: "🥜",
    badgeClass: "bg-emerald-600 text-white border-emerald-700",
    bgLight: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  "Savory & Meat Snacks": {
    id: "Savory & Meat Snacks",
    label: "Meat & Jerky",
    khmer: "សាច់កែច្នៃ",
    emoji: "🥩",
    badgeClass: "bg-rose-600 text-white border-rose-700",
    bgLight: "bg-rose-50 text-rose-800 border-rose-200",
  },
  "Alcohol & Wine": {
    id: "Alcohol & Wine",
    label: "Alcohol & Wine",
    khmer: "ស្រា និង ស្រាកូរ៉េ",
    emoji: "🍷",
    badgeClass: "bg-purple-600 text-white border-purple-700",
    bgLight: "bg-purple-50 text-purple-800 border-purple-200",
  },
  "Dairy & Prepared Desserts": {
    id: "Dairy & Prepared Desserts",
    label: "Dairy & Desserts",
    khmer: "យ៉ាអួ និង បង្អែម",
    emoji: "🥛",
    badgeClass: "bg-cyan-600 text-white border-cyan-700",
    bgLight: "bg-cyan-50 text-cyan-800 border-cyan-200",
  },
  "Cooking & Condiments": {
    id: "Cooking & Condiments",
    label: "Pantry & Sauces",
    khmer: "គ្រឿងផ្សំ",
    emoji: "🍳",
    badgeClass: "bg-yellow-600 text-white border-yellow-700",
    bgLight: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  "Toys & Novelties": {
    id: "Toys & Novelties",
    label: "Toys & Gifts",
    khmer: "ក្មេងលេង",
    emoji: "🧸",
    badgeClass: "bg-indigo-600 text-white border-indigo-700",
    bgLight: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  "Store Announcements": {
    id: "Store Announcements",
    label: "Store Info",
    khmer: "ព័ត៌មានហាង",
    emoji: "📢",
    badgeClass: "bg-zinc-600 text-white border-zinc-700",
    bgLight: "bg-zinc-100 text-zinc-700 border-zinc-300",
  },
};

// Priority sorting order for display
export const CATEGORY_ORDER = [
  "All",
  "Biscuits, Chips & Snacks",
  "Beverages & Drinks",
  "Candy, Chocolate & Jelly",
  "Instant Noodles & Meals",
  "Dried Fruits, Nuts & Cereals",
  "Savory & Meat Snacks",
  "Alcohol & Wine",
  "Dairy & Prepared Desserts",
  "Cooking & Condiments",
  "Toys & Novelties",
  "Store Announcements",
];

export function getCategoryMeta(type: string): CategoryMeta {
  return CATEGORIES_CONFIG[type] || {
    id: type,
    label: type,
    emoji: "🏷️",
    badgeClass: "bg-zinc-700 text-white border-zinc-800",
    bgLight: "bg-zinc-100 text-zinc-800 border-zinc-200",
  };
}
