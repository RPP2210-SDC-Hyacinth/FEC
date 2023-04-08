import React, { useState, useEffect, useRef, createContext } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './components/header/Header.jsx';
import Overview from './components/overview/Overview.jsx';
import QA from './components/qa/QA.jsx';
import RelatedProducts from './components/relatedProducts/RelatedProducts.jsx';
import Reviews from './components/reviews/Reviews.jsx';
import { ProductListInfo, OutfitListInfo } from './components/relatedProducts/RelatedProductRequests.jsx';

const axios = require('axios');

const domNode = document.getElementById('root');
const root = createRoot(domNode);
const ThemeContext = createContext('light');

const App = () => {

  // Change this later to no longer hard-code starting productId || VERTICAL, FRIENDLY: 71697, 71699, 71702 || HORIZONTAL, PROBLEMATIC: 71701
  const [productId, setProductId] = useState(71697);
  const [productName, setProductName] = useState('');
  const [styleId, setStyleId] = useState(null);
  const [averageStarRating, setAverageStarRating] = useState(null);
  const [totalNumberReviews, setTotalNumberReviews] = useState(null);
  const [myOutfit, setMyOutfit] = useState([]);
  const [outfitCards, setOutfitCards] = useState([]);
  const [productFeatures, setProductFeatures] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productDefaultImg, setProductDefaultImg] = useState('');
  const [productCards, setProductCards] = useState([]);
  const [relatedProductFeatures, setRelatedProductFeatures] = useState([]);
  const [relatedProductName, setRelatedProductName] = useState('');
  const [inOutfit, setInOutfit] = useState(false);
  const [theme, setTheme] = useState("light");

  // REF FOR OVERVIEW/REVIEWS COMMS
  const reviewsRef = useRef(null);

  useEffect(() => {
    // localStorage.removeItem("outfitList");
    // localStorage.setItem("outfitList", JSON.stringify([]));
    if (localStorage.getItem("outfitList") === undefined || localStorage.getItem("outfitList") === null) {
      localStorage.setItem("outfitList", JSON.stringify([]));
      localStorage.setItem("outfitListDetails", JSON.stringify([]));
    }
    updateSelectedProduct(productId);
  }, []);

  // To-Do: Add function to start initial rendering of app in real-time - Likely will involve useEffect ***
  const updateSelectedProduct = (product_id) => {
    axios.get(`/products/${product_id}`, {
      params: {
        product_id: product_id
      }
    })
      .then(productData => {
        setProductId(productData.data.id);
        setProductName(productData.data.name);
        setProductFeatures(productData.data.features);
        return axios.get(`/products/${product_id}/related`, {
          params: {
            product_id: product_id
          }
        })
      })
      .then(relatedProductsData => {
        return axios.get('/relatedProducts/info', {
          params: {
            relatedProducts: relatedProductsData.data,
            productId: productId,
            listName: 'related'
          }
        })
        .then((results) => {
          setRelatedProducts(results.data);
          return ProductListInfo(results.data, setRelatedProductFeatures, productFeatures, setRelatedProductName, setProductId, updateSelectedProduct, productId, setProductCards);
        })
      })
      .then(success => {
        return axios.get(`/products/${product_id}/styles`, {
          params: {
            product_id: product_id
          }
        })
      })
      .then(productStyles => {
        setStyleId(productStyles.data.results[0].style_id);
        var outfitList = JSON.parse(localStorage.getItem("outfitListDetails"));
        //set my outfit?
        if (outfitList.length !== 0) {
          return OutfitListInfo(setOutfitCards, setProductId, productId, outfitList, setMyOutfit, updateSelectedProduct, inOutfit, setInOutfit);
        }
      })
      .catch(error => {
        console.error('Error in updateSelectedProduct: ', error);
      })
  }

  const updateAverageRating = (averageRating) => {
    setAverageStarRating(averageRating)
  }

  const updateTotalNumberReviews = (count) => {
    setTotalNumberReviews(count);
  }

  const toggleTheme = (currentTheme) => {
    console.log('Toggling Theme! ', theme);
    currentTheme === "light" ? setTheme("dark") : setTheme("light");
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div id={theme}>
        <Header theme={theme} toggleTheme={toggleTheme}/>
        <Overview productId={productId} styleId={styleId} averageStarRating={averageStarRating} totalNumberReviews={totalNumberReviews} productFeatures={productFeatures} updateSelectedProduct={updateSelectedProduct} myOutfit={myOutfit} setMyOutfit={setMyOutfit} setOutfitCards={setOutfitCards} setProductId={setProductId} updateSelectedProduct={updateSelectedProduct} inOutfit={inOutfit} setInOutfit={setInOutfit} reviewsRef={reviewsRef} />
        <RelatedProducts inOutfit={inOutfit} setInOutfit={setInOutfit} OutfitListInfo={OutfitListInfo} productId={productId} relatedProductFeatures={relatedProductFeatures} productFeatures={productFeatures} myOutfit={myOutfit} productCards={productCards} setMyOutfit={setMyOutfit} outfitCards={outfitCards} productName={productName} relatedProductName={relatedProductName} setProductId={setProductId} setOutfitCards={setOutfitCards} updateSelectedProduct={updateSelectedProduct}/>
        <QA productId={productId} productName={productName}/>
        <Reviews updateSelectedProduct={updateSelectedProduct} productId={productId} productName={productName} totalNumberReviews={totalNumberReviews} updateTotalNumberReviews={updateTotalNumberReviews} updateAverageRating={updateAverageRating} averageStarRating={averageStarRating} reviewsRef={reviewsRef}/>
      </div>
    </ThemeContext.Provider>
  );
};

root.render(<App />);