export interface GamePackage {
  cny: number;
  vp: number;
}

export interface GiftCard {
  cny: number;
  price: number;
}

export interface GiftCardLine extends GiftCard {
  quantity: number;
}

export interface PricingResult {
  requestedVp: number;
  gamePackage: GamePackage;
  requiredCny: number;
  walletUsedCny: number;
  cnyToBuy: number;
  giftCards: GiftCardLine[];
  totalGiftCny: number;
  leftoverCny: number;
  operationCost: number;
  salePrice: number;
  profit: number;
  marginPercent: number;
}

export const GAME_PACKAGES: GamePackage[] = [
  { cny: 10, vp: 100 },
  { cny: 30, vp: 308 },
  { cny: 68, vp: 700 },
  { cny: 128, vp: 1318 },
  { cny: 198, vp: 2060 },
  { cny: 328, vp: 3518 },
];

export const GIFT_CARDS: GiftCard[] = [
  { cny: 10, price: 9.28 },
  { cny: 20, price: 17.33 },
  { cny: 50, price: 44.00 },
  { cny: 100, price: 87.00 },
];

export const MARGIN_OPTIONS = [30, 35, 40, 50];

export const findGamePackage = (vpRequired: number) => {
  const normalizedVp = Math.max(0, Number(vpRequired) || 0);
  return GAME_PACKAGES.find(pkg => pkg.vp >= normalizedVp) || GAME_PACKAGES[GAME_PACKAGES.length - 1];
};

const findCheapestGiftCombination = (neededCny: number) => {
  if (neededCny <= 0) return { totalGiftCny: 0, operationCost: 0, giftCards: [] as GiftCardLine[] };

  const maxCny = neededCny + 100;
  const bestByCny: Array<{ cost: number; counts: number[] } | null> = Array(maxCny + 1).fill(null);
  bestByCny[0] = { cost: 0, counts: GIFT_CARDS.map(() => 0) };

  for (let total = 0; total <= maxCny; total++) {
    const current = bestByCny[total];
    if (!current) continue;

    GIFT_CARDS.forEach((card, index) => {
      const nextTotal = total + card.cny;
      if (nextTotal > maxCny) return;

      const nextCost = Number((current.cost + card.price).toFixed(2));
      const previous = bestByCny[nextTotal];
      if (!previous || nextCost < previous.cost) {
        const counts = [...current.counts];
        counts[index] += 1;
        bestByCny[nextTotal] = { cost: nextCost, counts };
      }
    });
  }

  let bestTotal = neededCny;
  for (let total = neededCny; total <= maxCny; total++) {
    const candidate = bestByCny[total];
    const best = bestByCny[bestTotal];
    if (!candidate) continue;
    if (!best || candidate.cost < best.cost || (candidate.cost === best.cost && total < bestTotal)) {
      bestTotal = total;
    }
  }

  const best = bestByCny[bestTotal]!;
  const giftCards = best.counts
    .map((quantity, index) => ({ ...GIFT_CARDS[index], quantity }))
    .filter(card => card.quantity > 0);

  return { totalGiftCny: bestTotal, operationCost: best.cost, giftCards };
};

export const calculatePricing = (vpRequired: number, marginPercent: number, walletBalanceCny = 0): PricingResult => {
  const gamePackage = findGamePackage(vpRequired);
  const requiredCny = gamePackage.cny;
  const walletUsedCny = Math.min(Math.max(0, walletBalanceCny), requiredCny);
  const cnyToBuy = Math.max(0, requiredCny - walletUsedCny);
  const combination = findCheapestGiftCombination(cnyToBuy);
  const leftoverCny = Math.max(0, combination.totalGiftCny - cnyToBuy);
  const operationCost = combination.operationCost;
  const salePrice = Number((operationCost * (1 + marginPercent / 100)).toFixed(2));
  const profit = Number((salePrice - operationCost).toFixed(2));

  return {
    requestedVp: Number(vpRequired) || 0,
    gamePackage,
    requiredCny,
    walletUsedCny,
    cnyToBuy,
    giftCards: combination.giftCards,
    totalGiftCny: combination.totalGiftCny,
    leftoverCny,
    operationCost,
    salePrice,
    profit,
    marginPercent,
  };
};

export const formatGiftCombination = (giftCards: GiftCardLine[]) =>
  giftCards.length
    ? giftCards.map(card => `${card.quantity}x Gift ${card.cny} CNY`).join('\n')
    : 'Usar saldo da carteira';
