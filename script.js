// ============================================
// THE DREAMSCAPE - INTERACTIVE FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupScrollEffects();
    setupInteractiveCards();
    initializeCarousel();
    setupCategoryFiltering();
});

// Initialize entrance animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe story cards and category cards (skip featured-stories section)
    document.querySelectorAll('.story-card:not(#featuredStories .story-card), .category-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Setup scroll effects
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Setup interactive card effects
function setupInteractiveCards() {
    const cards = document.querySelectorAll('.story-card, .category-card, .carousel-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });

        card.addEventListener('click', function() {
            // Add subtle feedback when card is clicked
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // If it's a story card with a URL, change the iframe and scroll to viewer
            let url = null;
            let title = this.querySelector('h3').textContent;
            
            if (this.classList.contains('story-card') && this.dataset.url) {
                url = this.dataset.url;
            } else if (this.classList.contains('carousel-card')) {
                // For carousel cards, get URL from parent carousel-item
                const parentItem = this.closest('.carousel-item');
                if (parentItem && parentItem.dataset.url) {
                    url = parentItem.dataset.url;
                }
            }
            
            if (url) {
                const iframe = document.querySelector('#bookViewer iframe');
                const viewerTitle = document.querySelector('#bookViewer h2');
                if (iframe) {
                    iframe.src = url;
                    iframe.title = title;
                }
                if (viewerTitle) {
                    viewerTitle.textContent = '📖 Read: ' + title;
                }
                document.getElementById('bookViewer').scrollIntoView({behavior: 'smooth'});
            }
        });
    });
}

// Smooth scroll with offset for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open elements if needed
        console.log('Escape key pressed');
    }
});

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================

let currentSlide = 0;
let carouselItems = [];
let startX = 0;
let endX = 0;
let isDragging = false;

function initializeCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselDotsContainer = document.getElementById('carouselDots');

    if (!carouselInner) return;

    carouselItems = document.querySelectorAll('.carousel-item');
    const itemCount = carouselItems.length;

    // Create carousel dots
    for (let i = 0; i < itemCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        carouselDotsContainer.appendChild(dot);
    }

    // Navigation button listeners
    carouselPrev?.addEventListener('click', () => prevSlide());
    carouselNext?.addEventListener('click', () => nextSlide());

    // Touch/swipe support
    carouselInner.addEventListener('touchstart', handleTouchStart, false);
    carouselInner.addEventListener('touchend', handleTouchEnd, false);

    // Mouse drag support
    carouselInner.addEventListener('mousedown', handleMouseDown, false);
    carouselInner.addEventListener('mousemove', handleMouseMove, false);
    carouselInner.addEventListener('mouseup', handleMouseUp, false);
    carouselInner.addEventListener('mouseleave', handleMouseUp, false);

    // Carousel item click handlers
    carouselItems.forEach(item => {
        const card = item.querySelector('.carousel-card');
        if (card) {
            card.addEventListener('click', function(e) {
                e.stopPropagation();
                const dataUrl = item.dataset.url;
                if (dataUrl) {
                    const iframe = document.querySelector('#bookViewer iframe');
                    const viewerTitle = document.querySelector('#bookViewer h2');
                    if (iframe) {
                        iframe.src = dataUrl;
                        iframe.title = item.querySelector('h3').textContent;
                    }
                    if (viewerTitle) {
                        viewerTitle.textContent = '📖 Read: ' + item.querySelector('h3').textContent;
                    }
                    document.getElementById('bookViewer').scrollIntoView({behavior: 'smooth'});
                }
            });
        }
    });

    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselItems.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    if (!carouselInner) return;

    // Update carousel position
    const translateX = -currentSlide * 100;
    carouselInner.style.transform = `translateX(${translateX}%)`;

    // Update dots
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
}

function handleTouchEnd(e) {
    endX = e.changedTouches[0].clientX;
    isDragging = false;
    handleSwipe();
}

function handleMouseDown(e) {
    startX = e.clientX;
    isDragging = true;
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
}

function handleMouseUp(e) {
    endX = e.clientX;
    isDragging = false;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left, go to next
            nextSlide();
        } else {
            // Swiped right, go to previous
            prevSlide();
        }
    }
}

// Function to show all stories from menu
function showAllStories() {
    const categoryCards = document.querySelectorAll('.category-card[data-filter]');
    const storyCards = document.querySelectorAll('#storyLibraryGrid .story-card');
    
    // Remove active class from all category cards
    categoryCards.forEach(c => c.classList.remove('active'));
    
    // Show all stories
    storyCards.forEach(story => {
        story.style.display = 'block';
        story.style.opacity = '1';
    });
    
    // Scroll to story library
    setTimeout(() => {
        document.querySelector('#storyLibrary').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function setupCategoryFiltering() {
    const categoryCards = document.querySelectorAll('.category-card[data-filter]');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const selectedCategory = this.dataset.filter;
            const storyCards = document.querySelectorAll('#storyLibraryGrid .story-card');
            
            // Remove active class from all category cards
            categoryCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Filter stories - handle multiple categories separated by space
            let visibleCount = 0;
            storyCards.forEach(story => {
                const storyCategories = story.dataset.category?.split(' ') || [];
                if (storyCategories.includes(selectedCategory)) {
                    story.style.display = 'block';
                    story.style.opacity = '1';
                    story.style.animation = 'fadeIn 0.5s ease';
                    visibleCount++;
                } else {
                    story.style.display = 'none';
                }
            });
            
            // Show message if no stories found
            if (visibleCount === 0) {
                alert('No stories found in this category.');
            }
            
            // Scroll to Story Library
            document.querySelector('#storyLibrary').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Add event listener to reset filter when clicking active category
    categoryCards.forEach(card => {
        card.addEventListener('dblclick', function() {
            // Double-click to show all stories
            categoryCards.forEach(c => c.classList.remove('active'));
            document.querySelectorAll('#storyLibraryGrid .story-card').forEach(story => {
                story.style.display = 'block';
                story.style.opacity = '1';
            });
            alert('Showing all stories. Click a category to filter.');
        });
    });
}

// Add fadeIn animation to CSS (will be added via style tag)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .category-card.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: scale(1.05);
    }
    .category-card.active h3,
    .category-card.active p {
        color: white;
    }
`;
document.head.appendChild(style);

// Log page load info
console.log('🎉 Welcome to The Dreamscape!');
console.log('📚 This website is dedicated to children\'s stories and adventures.');
console.log('✨ Enjoy exploring our collection of magical tales!');
