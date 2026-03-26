import { Promotion } from '../models/Promotion';
import { IProduct } from '../models/Product';

/**
 * Calculates the current price of a product taking active promotions into account.
 * @param product The product object or ID
 * @returns The current discounted price
 */
export async function getCurrentPrice(product: any): Promise<number> {
    const productId = typeof product === 'number' ? product : product._id || product.id;
    const basePrice = typeof product === 'number' ? 0 : product.sellingPrice;
    
    // If we only have the ID, we might need the base price from DB first
    // but usually this is called with a populated product object.
    let actualBasePrice = basePrice;
    if (typeof product === 'number' || !basePrice) {
        const { Product } = await import('../models/Product');
        const p = await Product.findById(productId);
        if (!p) return 0;
        actualBasePrice = p.sellingPrice;
    }

    const currentDate = new Date();
    const activePromotion = await Promotion.findOne({
        product: productId,
        status: 'ACTIVE',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
    });

    if (!activePromotion) {
        return actualBasePrice;
    }

    if (activePromotion.discountType === 'PERCENTAGE') {
        const discount = (actualBasePrice * activePromotion.discountValue) / 100;
        return Math.max(0, actualBasePrice - discount);
    } else if (activePromotion.discountType === 'FIXED_AMOUNT') {
        return Math.max(0, actualBasePrice - activePromotion.discountValue);
    }

    return actualBasePrice;
}
