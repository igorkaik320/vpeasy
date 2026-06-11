import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import HeroCarousel from '@/components/store/HeroCarousel';
import InfoBanners from '@/components/store/InfoBanners';
import FeaturedProducts from '@/components/store/FeaturedProducts';
import ReviewsSection from '@/components/store/ReviewsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-6">
        <HeroCarousel />
        <InfoBanners />
        <FeaturedProducts />
        <ReviewsSection />
      </main>
      <StoreFooter />
    </div>
  );
};

export default Index;
