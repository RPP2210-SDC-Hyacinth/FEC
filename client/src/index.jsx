import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Overview from './components/overview/Overview.jsx'
import QA from './components/qa/QA.jsx'
import RelatedProducts from './components/relatedProducts/RelatedProducts.jsx'
import Reviews from './components/reviews/Reviews.jsx'
import { ProductListInfo, OutfitListInfo } from './components/relatedProducts/RelatedProductRequests.jsx';

const axios = require('axios');

const domNode = document.getElementById('root');
const root = createRoot(domNode);

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


  useEffect(() => {
    // localStorage.removeItem("outfitList");
    // localStorage.setItem("outfitList", JSON.stringify([]));
    if (localStorage.getItem("outfitList") === undefined) {
      localStorage.setItem("outfitList", JSON.stringify([]));
    } else {
      setMyOutfit(JSON.parse(localStorage.getItem("outfitList")));
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
          setRelatedProducts(results);
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
        var outfitList = JSON.parse(localStorage.getItem("outfitList"))
        if (outfitList.length !== 0) {
          return axios.get('/relatedProducts/info', {
            params: {
              relatedProducts: outfitList,
              productId: productId,
              listName: 'outfit'
            }
          })
        }
      })
      .then((results) => {
        setMyOutfit(results.data);
        return OutfitListInfo(setOutfitCards, setProductId, productId, results.data, setMyOutfit, updateSelectedProduct);
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


  return (
    <div>
      Hello World!
      <Overview id="overview" productId={productId} styleId={styleId} averageStarRating={averageStarRating} totalNumberReviews={totalNumberReviews} productFeatures={productFeatures} updateSelectedProduct={updateSelectedProduct}/>
      <RelatedProducts OutfitListInfo={OutfitListInfo} productId={productId} relatedProductFeatures={relatedProductFeatures} productFeatures={productFeatures} myOutfit={myOutfit} productCards={productCards} setMyOutfit={setMyOutfit} outfitCards={outfitCards} productName={productName} relatedProductName={relatedProductName} setProductId={setProductId} setOutfitCards={setOutfitCards} updateSelectedProduct={updateSelectedProduct}/>
      <QA productId={productId} productName={productName}/>
      <Reviews updateSelectedProduct={updateSelectedProduct} productId={productId} productName={productName} totalNumberReviews={totalNumberReviews} updateTotalNumberReviews={updateTotalNumberReviews} updateAverageRating={updateAverageRating} averageStarRating={averageStarRating}/>
    </div>
  );
};

root.render(<App />);