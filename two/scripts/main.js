
const url = `./media/products.json`;

fetch(url).then((response)=>{
    if(!response.ok){
        throw new Error(`Http Error: ${response.status}`);
    }

    return response.json();
}).then((data)=>{
    initialize(data);
}).catch((error)=>{
    console.error(`Failed to fetch: ${error.message}`);
})

function initialize(products){
    // grab the UI elements
    const category = document.querySelector("#category");
    const searchTerm = document.querySelector("#searchTerm");
    const searchBtn = document.querySelector("button");
    const main = document.querySelector("main");

    // keep a record of what the last category and search were
    let lastCategory = category.value;
    // no search has been made yet
    let lastSearch = "";

    let categoryGroup;
    let finalGroup;

    // to start with, set finalGroup to the entire products database
    //  then updateDisplay() so that all products are displayed initially
    finalGroup = products;
    updateDisplay();

    // set both to empty array, in time for searches to be run
    categoryGroup = [];
    finalGroup = [];

    // when the searchBtn is clicked, invoke the selectCategory() to start a search running 
    // to select the category of products we want to display
    searchBtn.addEventListener("click", selectCategory);

    function selectCategory(e){
        e.preventDefault();

        // set these back to empty arrays to clear out the previous search
        categoryGroup = [];
        finalGroup = [];

        // if the category and searchTerm are the same as they were the last time a search
        // was run, the results will be the same, so there will be no point running it again - just
        // run out the function
        if(category.value === lastCategory && searchTerm.value.trim() === lastSearch){
            return;
        }else{
            // update the record of last category and search term
            lastCategory = category.value;
            lastSearch = searchTerm.value.trim();

            // in this case, we want to select all products, then filter them by the search term
            // so we just set categoryGroup to the entire JSON object, then run selectProducts()
            if(category.value === "All"){
                finalGroup = products;
                selectProducts();

                // if a specific category is chosen, we need to filter out the products not in that
                // category, then put the remaining products inside categoryGroup before running 
                // selectProducts()

            }else{
                // set <option> category to lowercase
                const lowercaseType = category.value.toLowerCase();
                // filter categoryGroup to contain only products whose type includes the categoty
                categoryGroup = products.filter(product=>product.type === lowercaseType);

                // run selectProducts after filtering has been done 
                selectProducts();
            }
        }

    }

    // selectProducts() Takes the group of products selected by selectCategory(), and further filters them 
    // by the tired search term (if one has been enetered) 
    function selectProducts(){
        // if no seach term has been entered, just make the finalGroup Array equal to the category array
        // - we do not want to filter the products further
        if(searchTerm.value.trim() === ""){
            finalGroup = categoryGroup;
        }else{
            // make sure the search term is converted to lower case before comparison. We've kept the product
            // names all lower case to keep things simple
            const lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();
            // filter finalGroup to contain only products whose name includes the search term
            finalGroup = categoryGroup.filter(product=>product.name.includes(lowerCaseSearchTerm));
        }
        // once we have the finalGroup, update the display
        updateDisplay();
    }
 
    // start the process of updating the display with the new set of products
    function updateDisplay(){
        // remove the previous contents of the <main> element
        while(main.firstChild){
            main.removeChild(main.firstChild);
        }
        // if no no products match the search term, dispaly a "No results to display"\
        if(finalGroup.length === 0){
            const text = document.createElement("p");
            text.textContent = "No results to display";
            main.appendChild(text);
        // for each product we want to display, pass its product object to fetchBlob()
        }else{
            for(const product of finalGroup){
                fetchBlob(product);
            }
        }
    }

    function fetchBlob(product){
        // construct the url path to the image
        const url = `./images/${product.image}`;

        fetch(url).then((response)=>{
            if(!response.ok){
                throw new Error(`Http Error: ${response.status}`);
            }

            return response.blob();
        }).then((blob)=>{
            showProduct(blob, product);
        }).catch((error)=>{
            console.error(`Failed to return blob: ${error.message}`);
        })

    }

    // Display a product inside the <main> element
    function showProduct(blob, product){
        // convert the blob into an object URL - this is 
        // basically a temporary internal URL that points to an object stored inside the browser 
        console.log("BLob: ",blob);
        const objectURL = URL.createObjectURL(blob);
        console.log("object URL: ",objectURL);
        // construct <h2>, <p>, <section>, <img/> elements
        const section = document.createElement("section");
        const heading = document.createElement("h2");
        const para = document.createElement("p");
        const image = document.createElement("img");

        // give <section> a classname equal to product "type" property so it will display the correct icon
        section.setAttribute("class", product.type);

        // give the <h2> textcontent equal to product "name" property, but with the first
        // character replaced with Uppercase letter
        heading.textContent = product.name.replace(product.name.charAt(0), product.name.charAt(0).toUpperCase());

        // give <p> textcontent equal to product "price" with $ sign preceding and toFixed(2)
        // used to fix the price to 2 decimal places
        para.textContent = `$${product.price.toFixed(2)}`;

        // set the <img> src to objectURL and the alt to product "name" property
        image.src = objectURL;
        image.alt = product.name;

        main.appendChild(section);
        section.appendChild(heading);
        section.appendChild(para);
        section.appendChild(image);
    }

}

