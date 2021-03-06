# Shopify Checkout Reward Component
A small package for checking and applying an Omneo reward balance to Shopify Checkout. This component uses `React` for dom manipulation and `Unfetch` to polyfill modern `fetch` functionality.

## Shopify install
Installing this component includes a number of quick steps:

### Add Loyalty Reward product
Add a new product (Not a physical product) to Shopify with the description of `Loyalty Reward` or eqivalent and copy the variant ID. [Finding your Variant ID](https://help.shopify.com/themes/customization/products/variants/find-variant-id)

This is used by the checkout script and component to apply dynamic rewards to a transaction.

### Create component snippet
Create a new snippet in your Shopify theme called `omneo-checkout-rewards.liquid` and copy the following code into the start of the file. Add your Omneo url, token, profile id and the Shopify Variant ID of your Loyalty Reward product. Please ensure the `rewardVariantId` is an integer.
```
{% assign rewardVariantId = 0 %}
{% assign ignoreGiftCards = true %}
{% assign omneoTenant = "mjbale-staging" %}
{% assign omneoToken = false %}
{% assign title = "Loyalty rewards available:" %}
{% assign supportEmail = false %}
{% assign hideIfInactive = true %}
{% assign autoExpandSummary = true %}
{% assign loadingMessage = "Just a moment as we set up your account" %}
{% assign errorMessage = "There was an issue getting your rewards. Please try again or contact customer support." %}
```
Once the variables are added, add the following code to complete the snippet:
```
{% if customer != blank %}
    {% assign rewardApplied = false %}
    {% assign subtotalCalculated = checkout.subtotal_price %}
    {% assign subtotalFromAppliedReward = false %}

    {% for line_item in checkout.line_items %}
        {% if line_item.gift_card and ignoreGiftCards %}
            {% assign subtotalCalculated = subtotalCalculated | minus: line_item.original_price %}
        {% endif %}
        {% if line_item.variant_id == rewardVariantId %}
            {% for property in line_item.properties %}
                {% if property[0] == 'amount' %}
                    {% assign rewardApplied = property[1] %}
                {% endif %}
                {% if property[0] == 'subtotal' %}
                    {% assign subtotalFromAppliedReward = property[1] %}
                {% endif %}
            {% endfor %}
        {% endif %}
    {% endfor %}

    {% if subtotalFromAppliedReward %}
        {% assign subtotalCalculated = subtotalFromAppliedReward %}
    {% endif %}

    <script type="text/javascript" src="//cdn.omneo.io/shapes-shopify-checkout.js"></script>
    <script>
      ShapesShopifyCheckout.init({
          customerId: "{{ customer.id }}",
          customerSignature: "{{ customer.id | hmac_sha256: shop.metafields.omneo.id_secret }}",
          idUrl: "https://api.{{omneoTenant}}.getomneo.com/id",
          pluginUrl: "https://api.{{omneoTenant}}.getomneo.com/shopify",
          token: {% if omneoToken != false %}"{{omneoToken}}"{% else %}false{% endif %},
          rewardVariantId: {{rewardVariantId}},
          subTotal: {{subtotalCalculated}},
          rewardApplied: {{rewardApplied}},
          title: "{{title}}",
          loadingMessage: "{{loadingMessage}}",
          errorMessage: "{{errorMessage}}",
          supportEmail: {% if supportEmail != false %}"{{supportEmail}}"{% else %}false{% endif %},
          hideIfInactive: {{hideIfInactive}},
          autoExpandSummary: {{autoExpandSummary}}
      });
    </script>
{% endif %}
<style>
  .product[data-variant-id="{{rewardVariantId}}"]{display:none}
  .product[data-variant-id="{{rewardVariantId}}"]:first-child + tr .product__description{padding-top:0;}
  .product[data-variant-id="{{rewardVariantId}}"]:first-child + tr .product__image{padding-top:0;}
</style>
```

### Update checkout.liquid
Include the following code immediately before the head closing tag `</head>` in `checkout.liquid`: this is the best
```
{% include 'omneo-checkout-rewards' %}
```

### Add Omneo Token page template
Create a page template named page.omneoViewToken.liquid and add the following code:
```
<div style="display:none">
{% if customer.metafields.omneo != blank %}
	{% if customer.metafields.omneo.token != blank %}
  		<TOKEN>{{customer.metafields.omneo.token}}<TOKEN>
	{% endif %}
{% endif %}
</div>
```

### Create the token page
Make a new page in Shopify with the url `/pages/omneoviewtoken` and publish this page. This page should not be indexed or linked to from any other area.

### Add Shopify Script
If you haven't already installed the Shopify Scripts app, follow the instructions here: [Script Editor](https://apps.shopify.com/script-editor)

Navigate to the Shopify Scripts app and create a new `Line Items` script with a blank template. Copy the following script and ensure the reward variable id is updated to reflect your own Loyalty Reward product:

```
LOYALTY_ITEM_VARIATION_ID = 0
IGNORE_GIFT_CARDS = true

def get_valid_cart_amount(line_items)
  cart_amount = Integer(Input.cart.subtotal_price.cents.round.to_s)

  if line_items.kind_of?(Array)
    line_items.each do |line_item|
      if IGNORE_GIFT_CARDS and (line_item.variant.product.product_type == "Gift Card" or line_item.variant.product.gift_card?)
        cart_amount = cart_amount - Integer(line_item.line_price.cents.round.to_s)
      end
    end
  end

  cart_amount
end

def get_applied_loyalty_rewards(line_items)
  reward_amount = 0;
  cart_amount = get_valid_cart_amount(line_items)

  if line_items.kind_of?(Array)
    line_items.each do |line_item|
      if line_item.variant.id == LOYALTY_ITEM_VARIATION_ID
        next unless line_item.properties['amount']
        reward_amount = Float(line_item.properties['amount']) * 100

        if reward_amount > cart_amount
          reward_amount = cart_amount
          line_item.change_properties({
            'amount' => cart_amount * 0.01,
            'subtotal' => cart_amount
          },{ message: 'Updated value' })  
        else
          line_item.change_properties({
            'amount' => reward_amount * 0.01,
            'subtotal' => cart_amount
          },{ message: 'Updated value' })  
        end
      end
    end
  end

  reward_amount
end

def apply_loyalty_rewards(line_items)
  reward_amount = get_applied_loyalty_rewards(line_items)
  return unless 0 < reward_amount

  reward_remainder = 0.0
  total_reward_elegible_price = get_valid_cart_amount(line_items)

  if line_items.kind_of?(Array)
    line_items.each do |line_item|
      next unless !IGNORE_GIFT_CARDS or !(line_item.variant.product.product_type == "Gift Card" or line_item.variant.product.gift_card?)
      price = Integer(line_item.line_price.cents.round.to_s)
      if price > 0
        proportion =  price / total_reward_elegible_price
        discount_float = (reward_amount * proportion) + reward_remainder
        discount = discount_float.round
        reward_remainder =  discount_float - discount
        line_item.change_line_price(line_item.line_price - Money.new(cents: discount), message: 'Reward')
      end
    end
  end
end

apply_loyalty_rewards(Input.cart.line_items)

Output.cart = Input.cart
```

### Hide the Loyalty Reward product from public and go live
You're (almost) all done! Loyalty rewards should now be active and ready for customers to checkout. Just ensure that the the Loyalty Reward placeholder product is not visible in any collections or publicly facing product views.

## DEVELOPMENT
### Dependencies
* `Preact` for dom manipulation and tiny code footprint
* `Unfetch` for HTTP requests, based on fetch() spec
* `Webpack 4` for code bundling and minification

### Getting started
```
yarn install
yarn watch
```
This component requires a Shopify Checkout environment and liquid code to function correctly. Local development should be completed using ThemeKit or by including the local main.js file in a development theme, through port forwarding such as NGROK etc.

### Hosting and Port forwarding via NGROK
When making changes to this repo, you can develop locally by:
1. Cloning the Repo, and running `yarn watch` (this will build, and rebuild on detected changes)
2. `cd` into the `/dist` directory
3. Host your local build using either `python -m SimpleHTTPServer` or `http-server` for node (you may need to install http-server globally `npm install http-server -g`)
4. Navigate to the returned address from the above. This is usually `localhost:8080/shapes-shopify-checkout.js`
5. If this hasn't worked, you need to make sure the step 3 command was run in `/dist`, and make sure you've run `yarn watch`
6. install NGROK on your machine
7. run `ngrok http 8080 -region au` your port may change depending on your http server. The region can also be changed to improve performance.
8. Note down the `https` address in the console, and navigate to this in a browser. You should be directed to your local directory containing `shapes-shopify-checkout.js`
9. Navigate to your Shopify theme, and modify `/snippets/omneo-checkout-rewards.liquid`
10. Modify the script import with your NGROK `https` address ` <script type="text/javascript" src="{YOUR_NGROK_ADDRESS}/shapes-shopify-checkout.js"></script>`
11. Preview your theme, this theme will now be directed to your local machine to import the `shapes-shopify-checkout.js`
