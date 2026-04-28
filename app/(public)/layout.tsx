import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RandomPickerProvider } from "@/components/random-picker";
import { SearchProvider } from "@/components/search";
import { getAllCategories, getAllPlaces } from "@/lib/queries/places";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, places] = await Promise.all([
    getAllCategories(),
    getAllPlaces(),
  ]);

  return (
    <SearchProvider places={places} categories={categories}>
      <RandomPickerProvider places={places}>
        <Header categories={categories} />
        <main>{children}</main>
        <Footer categories={categories} />
        <CookieBanner />
      </RandomPickerProvider>
    </SearchProvider>
  );
}
