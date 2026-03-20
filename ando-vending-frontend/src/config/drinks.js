/**
 * Ando Tea House — Drink Menu Configuration
 *
 * Single source of truth for all drink data.
 * To add a new drink: add an entry to the DRINKS array below.
 *
 * Each drink requires:
 *   id          — unique slug (used as drinkId in orders)
 *   name        — display name shown on menu
 *   description — short description for the menu card
 *   basePrice   — starting price (smallest size)
 *   sizes       — array of { size, price } where price is the upcharge from basePrice
 *   icon        — which icon component to render ('matcha' for now, extend as needed)
 *   videoUrl    — preparation video path (placed in /public/videos/)
 */

export const DRINKS = [
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Ceremonial-grade matcha, stone-ground and whisked with steamed milk',
    basePrice: 6.50,
    sizes: [
      { size: 'Small', price: 0 },
      { size: 'Medium', price: 0.75 },
      { size: 'Large', price: 1.50 },
    ],
    icon: 'matcha',
    videoUrl: '/videos/matcha.mp4',
  },
  {
    id: 'hojicha-latte',
    name: 'Hojicha Latte',
    description: 'Roasted green tea with a warm, caramel-like sweetness',
    basePrice: 7.00,
    sizes: [
      { size: 'Small', price: 0 },
      { size: 'Medium', price: 0.75 },
      { size: 'Large', price: 1.50 },
    ],
    icon: 'hojicha',
    videoUrl: '/videos/hojicha.mp4',
  },
]

/**
 * Look up a drink by its ID.
 * Returns undefined if not found.
 */
export function getDrinkById(id) {
  return DRINKS.find(d => d.id === id)
}

/**
 * Get the total price for a drink + size combo.
 */
export function getDrinkPrice(drink, sizeName) {
  const sizeData = drink.sizes.find(s => s.size === sizeName)
  return drink.basePrice + (sizeData?.price || 0)
}
