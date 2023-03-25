const express = require('express');
const path = require('path');
const app = express();
const cart_api = require('./api_handlers/cart');
const interactions_api = require('./api_handlers/interactions');
const products_api = require('./api_handlers/products');
const qa_api = require('./api_handlers/qa');
const reviews_api = require('./api_handlers/reviews');
const expressStaticGzip = require('express-static-gzip');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
// Make sure to comment this out when testing through Postman***
app.use(expressStaticGzip(path.join(__dirname,'../client/dist'), {
  enableBrotli: true
}));

// PRODUCT ROUTES:

app.get('/products', (req, res) => {
  products_api.getAllProducts()
    .then(allProducts => {
      res.status(200).send(allProducts.data);
    })
    .catch(error => {
      console.error('Error in getAllProducts: ', error);
      res.status(404).send(error);
    });
});

app.get('/products/:product_id', (req, res) => {
  var product_id = req.params.product_id;
  products_api.getOneProduct(product_id)
    .then((productDetails) => {
      res.status(200).send(productDetails.data)
    })
    .catch((error) => {
      console.error('Error in getOneProduct: ', error);
      res.status(404).send(error);
    })
});

app.get('/products/:product_id/related', (req, res) => {
  var product_id = req.params.product_id;
  products_api.getRelated(product_id)
    .then((relatedProducts) => {
      //console.log('Related Products Request: ', relatedProducts.data);
      res.status(200).send(relatedProducts.data)
    })
    .catch((error) => {
      console.error('Error in getRelated: ', error);
      res.status(404).send(error);
    })
});

app.get('/products/:product_id/styles', (req, res) => {
  var product_id = req.params.product_id;
  // console.log('THIS IS PRODUCT_ID: ', product_id);
  products_api.getStyles(product_id)
    .then((productStyles) => {
      res.status(200).send(productStyles.data)
    })
    .catch((error) => {
      console.error('Error in getStyles: ', error);
      res.status(404).send(error);
    })
});

// CART ROUTES:
app.get('/cart', (req, res) => {
  cart_api.getCartItems()
    .then((cartItems) => {
      res.status(200).send(cartItems.data);
    })
    .catch((error) => {
      res.status(404).send(error);
    })
});

app.post('/cart', (req, res) => {
  // console.log('Add to Cart Server Count: ', req.body.count);
  cart_api.addToCart(req.body.sku_id, req.body.count)
    .then((success) => {
      res.status(201).send('Item successfully added to cart!');
    })
    .catch((error) => {
      res.status(400).send(error);
    })
})

//REVIEW ROUTES:

app.get('/reviews', (req, res) => {
  reviews_api.getReviews(req, res)
    .then(reviews => {
      res.status(200).send(reviews.data);
    })
    .catch(error => {
      console.error('Error in getting reviews: ', error);
      res.status(404).send(error);
    });
});

app.get('/reviews/meta', (req, res) => {
  reviews_api.getReviewsMeta(req, res)
    .then(reviewsMeta => {
      res.status(200).send(reviewsMeta.data);
    })
    .catch(error => {
      console.error('Error in getting reviews meta: ', error);
      res.status(404).send(error);
    });
});

app.post('/reviews', (req, res) => {
  reviews_api.postReview(req, res)
    .then(success => {
      res.status(201).send('Success posting review');
    })
    .catch(error => {
      console.error('Error posting Review: ', error);
      res.status(404).send(error);
    });
});

app.put('/reviews/helpful', (req, res) => {
  reviews_api.putHelpful(req, res)
    .then(success => {
      res.status(204).send('Marked review helpful');
    })
    .catch(error => {
      console.error('Error marking Review helpful: ', error);
      res.status(404).send(error);
    });
});

app.put('/reviews/report', (req, res) => {
  reviews_api.putReportReview(req, res)
    .then(success => {
      res.status(204).send('Reported review')
    })
    .catch(error => {
      console.error('Error reporting Review: ', error);
      res.status(404).send(error);
    });
});

//END REVIEWS ROUTES

//QA ROUTES

app.get('/qa/questions', (req, res) => {
  qa_api.getProductQuestions(req.query.product_id)
    .then(questions => {
      res.status(200).send(questions.data);
    })
    .catch(error => {
      console.error('Error in getProductQuestions: ', error);
      res.status(404).send(error);
    });
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  qa_api.getProductAnswers(req.params.question_id)
    .then(answers => {
      res.status(200).send(answers.data);
    })
    .catch(error => {
      console.error('Error in getProductAnswers: ', error);
      res.status(404).send(error);
    });
});


app.post('/qa/questions', (req, res) => {
  qa_api.AddProductQuestion(req.body)
    .then(() => {
      res.status(201).send('Your question has been submitted!');
    })
    .catch(error => {
      console.error('Error in AddProductQuestion: ', error);
      res.status(404).send(error);
    });
});


app.post('/qa/questions/:question_id/answers', (req, res) => {
  qa_api.AddProductAnswer(req.params.question_id, req.body)
    .then(() => {
      res.status(201).send('Your answer has been submitted!');
    })
    .catch(error => {
      console.error('Error in AddProductQuestion: ', error);
      res.status(404).send(error);
    });
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  qa_api.updateQuestionHelpful(req.params.question_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => {
      console.error('Error marking question helpful: ', error);
      res.status(404).send(error);
    });
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  console.log('req.params.question_id', req.params.question_id)
  qa_api.updateQuestionReport(req.params.question_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => {
      console.error('Error reporting question:', error);
      res.status(404).send(error);
    });
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  qa_api.updateAnswerHelpful(req.params.answer_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => {
      console.error('Error marking answer helpful: ', error);
      res.status(404).send(error);
    });
});


app.put('/qa/answers/:answer_id/report', (req, res) => {
  console.log('req.params.question_id', req.params.answer_id)
  qa_api.updateAnswerReport(req.params.answer_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => {
      console.error('Error reporting answer:', error);
      res.status(404).send(error);
    });
});


// END QA ROUTES


app.listen(3000, function(){
  console.log('connected to server!')
});
