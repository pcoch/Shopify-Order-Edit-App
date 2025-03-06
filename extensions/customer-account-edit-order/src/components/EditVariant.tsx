import {
  Disclosure,
  BlockStack,
  Pressable,
  InlineLayout,
  ProductThumbnail,
  View,
  Icon,
  Text,
  Select,
  useCartLines,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";

export default function EditQuantity({ sessionToken, orderId }) {
  const [variantOptions, setVariantOptions] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});

  const lines = useCartLines();
  const { query } = useApi();

  const PRODUCTS_QUERY = `
      query GetProductsVariants($productIds: [ID!]!) {
        nodes(ids: $productIds) {
          ... on Product {
            id
            title
            variants(first: 100) {
              nodes {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `;

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = Array.from(
        new Set(lines.map((line) => line.merchandise.product.id)),
      );

      try {
        const response = await query(PRODUCTS_QUERY, {
          variables: { productIds },
        });
        const optionsMap = (response.data as any).nodes.reduce(
          (acc, product) => ({
            ...acc,
            [product.id]: product.variants.nodes.map((variant) => ({
              value: variant.id,
              label: variant.title,
            })),
          }),
          {},
        );
        setVariantOptions(optionsMap);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    if (lines?.length) {
      fetchProducts();
    }
  }, [lines, query]);

  useEffect(() => {
    const initialQuantities = {};
    const initialVariants = {};

    lines.forEach((line) => {
      initialQuantities[line.id] = line.quantity;
      initialVariants[line.id] = line.merchandise.id;
    });

    setSelectedVariants(initialVariants);
  }, [lines]);

  return (
    <BlockStack spacing="base">
      <Disclosure>
        <Pressable border={["none", "none", "base", "none"]} toggles="variants">
          <InlineLayout columns={["auto", "fill", "auto"]}>
            <View padding="base">
              <Icon source="reorder" />
            </View>
            <View padding="base">
              <Text emphasis="bold">Change options</Text>
            </View>
            <View padding="base">
              <Icon source="chevronDown" />
            </View>
          </InlineLayout>
        </Pressable>
        <View padding="base" id="variants">
          {lines?.map((line) => (
            <View
              key={line.id}
              border="none"
              padding={["none", "none", "loose", "none"]}
            >
              <InlineLayout
                columns={["auto", "fill"]}
                padding={["none", "none", "base", "none"]}
                blockAlignment="center"
              >
                {line.merchandise.image && (
                  <ProductThumbnail
                    source={line.merchandise.image.url}
                    alt={line.merchandise.title}
                    size="base"
                  />
                )}
                <BlockStack
                  padding={["none", "none", "none", "base"]}
                  spacing="extraTight"
                >
                  <Text>{line.merchandise.title}</Text>
                </BlockStack>
              </InlineLayout>
              {variantOptions[line.merchandise.product.id] &&
                line.merchandise.selectedOptions[0]?.value !==
                  "Default Title" && (
                  <Select
                    label="Options"
                    options={variantOptions[line.merchandise.product.id]}
                    value={selectedVariants[line.id]}
                    onChange={(value) => {
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [line.id]: value,
                      }));
                    }}
                  />
                )}
            </View>
          ))}
        </View>
      </Disclosure>
    </BlockStack>
  );
}
