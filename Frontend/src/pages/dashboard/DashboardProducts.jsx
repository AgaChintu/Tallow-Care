import { useCallback, useState } from 'react';
import DashNavbar from '../../components/dashboard/DashNavbar';
import DashFooter from '../../components/dashboard/DashFooter';
import MarketplaceProducts from '../../components/products/MarketplaceProducts';
import ProductQuickView from '../../components/products/ProductQuickView';
import { useCart } from '../../context/CartContext';
import '../../styles/dashboard.css';
import '../../styles/products.css';
import '../../styles/marketplace.css';

export default function DashboardProducts() {
  // FIX: Use CartContext for the actual cart operations and badge count.
  // The previous version maintained a LOCAL cartCount state that never
  // actually added items to the cart — the cart page would always be empty.
  const { addToCart, totalCount } = useCart();

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState({ visible: false, msg: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg: '' }), 2500);
  }, []);

  // FIX: Actually add the product to CartContext so it appears in My Cart.
  const handleAddToCart = useCallback((product) => {
    if (!product) return;
    addToCart(product, 1);
    showToast(`🛒 "${product.name}" added to cart!`);
  }, [addToCart, showToast]);

  return (
    <div className="dash-root prod-page-root">
      {/* FIX: cartCount now reflects the real CartContext total */}
      <DashNavbar cartCount={totalCount} onCartClick={() => {}} />

      {/* Toast notification */}
      <div className={`prod-toast${toast.visible ? ' prod-toast--visible' : ''}`}>
        {toast.msg}
      </div>

      {/* Marketplace — products immediately visible */}
      <MarketplaceProducts
        onAddToCart={handleAddToCart}
        onQuickView={setQuickViewProduct}
      />

      <DashFooter />

      {/* Quick view modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, qty) => {
            // FIX: actually add to cart from quick view as well
            if (product) addToCart(product, qty || 1);
            showToast(`🛒 "${product?.name}" added to cart!`);
            setQuickViewProduct(null);
          }}
        />
      )}
    </div>
  );
}
