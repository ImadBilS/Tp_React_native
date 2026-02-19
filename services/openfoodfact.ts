// services/openFoodFacts.ts

export const getProductByBarcode = async (barcode: string) => {
  try {
    // Appel direct à l'API publique d'Open Food Facts
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    );
    const data = await response.json();

    // Le statut 1 signifie que le produit a été trouvé
    if (data.status === 1) {
      return data.product;
    }

    return null; // Produit inconnu
  } catch (error) {
    console.error("Erreur lors de la requête à Open Food Facts :", error);
    return null;
  }
};

// Ajoute ceci à la fin de services/openfoodfact.ts

export const searchProductsByName = async (query: string) => {
  if (!query) return [];

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=5`,
    );
    const data = await response.json();

    if (data.products) {
      return data.products;
    }
    return [];
  } catch (error) {
    console.error("Erreur lors de la recherche textuelle :", error);
    return [];
  }
};
