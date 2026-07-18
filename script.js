(function () {
  'use strict';

  const IMAGES = [
    { full: 'images/image-product-1.jpg', thumb: 'images/image-product-1-thumbnail.jpg' },
    { full: 'images/image-product-2.jpg', thumb: 'images/image-product-2-thumbnail.jpg' },
    { full: 'images/image-product-3.jpg', thumb: 'images/image-product-3-thumbnail.jpg' },
    { full: 'images/image-product-4.jpg', thumb: 'images/image-product-4-thumbnail.jpg' },
  ];

  const PRODUCT = {
    name: 'Fall Limited Edition Sneakers',
    price: 125.0,
    thumb: 'images/image-product-1-thumbnail.jpg',
  };

  let currentIndex = 0;
  let quantity = 0;
  let cartQuantity = 0;
  let menuOpen = false;
  let cartOpen = false;
  let lightboxOpen = false;

  const body = document.body;
  const mainImage = document.querySelector('[data-main-image]');
  const thumbs = document.querySelectorAll('[data-thumb]');
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxThumbs = document.querySelectorAll('[data-lightbox-thumb]');
  const galleryMain = document.querySelector('[data-gallery-main]');

  const qtyValueEl = document.querySelector('[data-qty-value]');
  const cartCountEl = document.querySelector('[data-cart-count]');
  const cartBody = document.querySelector('[data-cart-body]');
  const cartPanel = document.querySelector('[data-cart]');

  const nav = document.querySelector('[data-nav]');
  const overlay = document.querySelector('[data-overlay]');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const menuOpenButton = document.querySelector('[data-menu-open]');
  const menuCloseButton = document.querySelector('[data-menu-close]');
  const cartToggleButton = document.querySelector('[data-cart-toggle]');

  function syncGlobalState() {
    const shouldShowOverlay = menuOpen || (cartOpen && window.innerWidth <= 600);
    const shouldLockScroll = menuOpen || lightboxOpen || (cartOpen && window.innerWidth <= 600);

    overlay.classList.toggle('is-visible', shouldShowOverlay);
    body.classList.toggle('is-scroll-locked', shouldLockScroll);
    menuOpenButton.setAttribute('aria-expanded', String(menuOpen));
    cartToggleButton.setAttribute('aria-expanded', String(cartOpen));
  }

  /* ---------------------------------------------- */
  /* Nav active state                                 */
  /* ---------------------------------------------- */
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove('is-active'));
      link.classList.add('is-active');
      if (window.innerWidth <= 600) closeMenu();
    });
  });

  /* ---------------------------------------------- */
  /* Gallery                                          */
  /* ---------------------------------------------- */
  function setImage(index) {
    currentIndex = (index + IMAGES.length) % IMAGES.length;
    mainImage.src = IMAGES[currentIndex].full;
    lightboxImage.src = IMAGES[currentIndex].full;

    thumbs.forEach((t) => t.classList.toggle('is-active', Number(t.dataset.index) === currentIndex));
    lightboxThumbs.forEach((t) => t.classList.toggle('is-active', Number(t.dataset.index) === currentIndex));
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => setImage(Number(thumb.dataset.index)));
  });
  lightboxThumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => setImage(Number(thumb.dataset.index)));
  });

  document.querySelector('[data-gallery-prev]').addEventListener('click', () => setImage(currentIndex - 1));
  document.querySelector('[data-gallery-next]').addEventListener('click', () => setImage(currentIndex + 1));
  document.querySelector('[data-lightbox-prev]').addEventListener('click', () => setImage(currentIndex - 1));
  document.querySelector('[data-lightbox-next]').addEventListener('click', () => setImage(currentIndex + 1));

  /* ---------------------------------------------- */
  /* Lightbox (desktop/tablet only)                   */
  /* ---------------------------------------------- */
  function openLightbox() {
    if (window.innerWidth <= 600) return;
    lightbox.hidden = false;
    lightboxOpen = true;
    syncGlobalState();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightboxOpen = false;
    syncGlobalState();
  }
  galleryMain.addEventListener('click', (e) => {
    if (e.target.closest('.gallery__arrow')) return;
    openLightbox();
  });
  document.querySelectorAll('[data-lightbox-close]').forEach((el) => el.addEventListener('click', closeLightbox));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (!lightbox.hidden) {
      if (e.key === 'ArrowLeft') setImage(currentIndex - 1);
      if (e.key === 'ArrowRight') setImage(currentIndex + 1);
    }
  });

  /* ---------------------------------------------- */
  /* Mobile nav                                       */
  /* ---------------------------------------------- */
  function openMenu() {
    cartOpen = false;
    cartPanel.hidden = true;
    nav.classList.add('is-open');
    menuOpen = true;
    syncGlobalState();
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    menuOpen = false;
    syncGlobalState();
  }
  menuOpenButton.addEventListener('click', openMenu);
  menuCloseButton.addEventListener('click', closeMenu);
  overlay.addEventListener('click', () => {
    closeMenu();
    closeCart();
  });

  /* ---------------------------------------------- */
  /* Quantity selector                                */
  /* ---------------------------------------------- */
  function setQuantity(value) {
    quantity = Math.max(0, value);
    qtyValueEl.textContent = String(quantity);
  }
  document.querySelector('[data-qty-minus]').addEventListener('click', () => setQuantity(quantity - 1));
  document.querySelector('[data-qty-plus]').addEventListener('click', () => setQuantity(quantity + 1));

  /* ---------------------------------------------- */
  /* Cart                                             */
  /* ---------------------------------------------- */
  function renderCart() {
    if (cartQuantity <= 0) {
      cartCountEl.hidden = true;
      cartBody.innerHTML = '<p class="cart__empty">Your cart is empty.</p>';
      return;
    }
    cartCountEl.hidden = false;
    cartCountEl.textContent = String(cartQuantity);

    const total = (PRODUCT.price * cartQuantity).toFixed(2);
    cartBody.innerHTML = `
      <div class="cart-item">
        <img src="${PRODUCT.thumb}" alt="${PRODUCT.name}" />
        <div class="cart-item__info">
          $${PRODUCT.price.toFixed(2)} x ${cartQuantity} <strong>$${total}</strong>
        </div>
        <button class="cart-item__delete" data-cart-delete aria-label="Remove item from cart">
          <span class="icon icon--delete"></span>
        </button>
      </div>
      <a href="#" class="btn-checkout">Checkout</a>
    `;

    document.querySelector('[data-cart-delete]').addEventListener('click', () => {
      cartQuantity = 0;
      renderCart();
    });
  }

  document.querySelector('[data-add-to-cart]').addEventListener('click', (e) => {
    e.stopPropagation();
    if (quantity <= 0) return;
    cartQuantity += quantity;
    setQuantity(0);
    renderCart();
    openCart();
  });

  function openCart() {
    menuOpen = false;
    nav.classList.remove('is-open');
    cartPanel.hidden = false;
    cartOpen = true;
    syncGlobalState();
  }
  function closeCart() {
    cartPanel.hidden = true;
    cartOpen = false;
    syncGlobalState();
  }
  cartToggleButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (cartPanel.hidden) openCart();
    else closeCart();
  });
  document.addEventListener('click', (e) => {
    if (!cartPanel.hidden && !cartPanel.contains(e.target) && !e.target.closest('[data-cart-toggle]')) {
      closeCart();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 600 && menuOpen) {
      closeMenu();
    }
    if (window.innerWidth <= 600 && lightboxOpen) {
      closeLightbox();
    } else {
      syncGlobalState();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMenu();
      closeCart();
    }
  });

  /* ---------------------------------------------- */
  /* Init                                             */
  /* ---------------------------------------------- */
  renderCart();
  syncGlobalState();
})();