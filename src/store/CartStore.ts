import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      // ฟังก์ชันหยิบของใส่ตะกร้า (ถ้ามีของเดิมอยู่แล้ว ให้เพิ่มจำนวน +1)
      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item._id === product._id);
        if (existingItem) {
          return {
            items: state.items.map(item => 
              item._id === product._id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            )
          };
        }
        return { 
          items: [...state.items, { 
            _id: product._id, 
            name: product.name, 
            price: product.price, 
            quantity: 1, 
            image: product.images?.[0] || "" 
          }] 
        };
      }),

      // ฟังก์ชันลบของออกจากตะกร้า
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item._id !== productId)
      })),

      // ฟังก์ชันล้างตะกร้า
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'mickey-shop-cart', // ชื่อ Key ที่จะเซฟลง Local Storage
    }
  )
);