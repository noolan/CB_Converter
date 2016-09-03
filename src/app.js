import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { capitalize, prune, slugify } from 'underscore.string';

if (typeof window !== 'undefined') {
	document.addEventListener("dragenter", function( event ) {

		event.stopPropagation();
		event.preventDefault();
	}, false);

	document.addEventListener("dragover", function( event ) {
		event.stopPropagation();
		event.preventDefault();
	}, false);

	document.addEventListener("drop", function( event ) {
		event.stopPropagation();
		event.preventDefault();

		let input = event.dataTransfer.files[0];

		document.querySelector('.converting-bar').classList.add('active');

		window.setTimeout(function handleDrop(event) {
			let data = [],
				output = '',
				rows = 0,
				skipped = [],
				status = document.getElementById('output');

			Papa.parse(input, {
				header: true,
				skipEmptyLines: true,
				step: function(row) {

					rows++;

					try {
						let r = row.data[0],
							type = r.product_type.split(' > '),
							grams = parseInt(r.shipping_weight.replace(' lbs', ''), 10) * 453.592;

						data.push([
							slugify(r.title), r.title, '', r.brand, type[0], type.join(' ').toLowerCase(), 'TRUE',
							'Title', 'Default Title', '', '', '', '',
							'', grams, '', 1, 'continue',
							'manual', r.price.replace(' USD', ''), '', 'TRUE', 'TRUE',
							'', r.image_link, 'Image of ' + r.title, 'FALSE', r.mpn,
							capitalize(r.age_group), capitalize(r.gender), r.google_product_category,
							prune(r.title + ' for sale', 66), prune(r.description, 156), type[0], type.join(', ').toLowerCase(),
							'new', 'TRUE',
							'', '', '', '', '', '', 'lb'
						]);
					} catch (e) {
						console.log(row);
						skipped.push(row);
					}

				},
				complete: function() {



					output = Papa.unparse({
						fields: [
							"Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
							"Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
							"Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
							"Variant Fulfillment Service", "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
							"Variant Barcode", "Image Src", "Image Alt Text", "Gift Card", "Google Shopping / MPN",
							"Google Shopping / Age Group", "Google Shopping / Gender", "Google Shopping / Google Product Category",
							"SEO Title", "SEO Description", "Google Shopping / AdWords Grouping", "Google Shopping / AdWords Labels",
							"Google Shopping / Condition", "Google Shopping / Custom Product",
							"Google Shopping / Custom Label 0", "Google Shopping / Custom Label 1", "Google Shopping / Custom Label 2",
							"Google Shopping / Custom Label 3", "Google Shopping / Custom Label 4", "Variant Image", "Variant Weight Unit"
						],
						data: data
					});

					status.textContent = 'Here\'s your file. (' + rows + ' rows | ' + skipped.length + ' skipped)';
					document.querySelector('.converting-bar').classList.remove('active');
					document.querySelector('.results').classList.add('finished');

					window.setTimeout(function() {
						let blob = new Blob([output], {type: "text/csv;charset=utf-8"});
						saveAs(blob, "shopifile.csv");
					}, 350);


				}
			});
		}, 500);
	}, false);
}
