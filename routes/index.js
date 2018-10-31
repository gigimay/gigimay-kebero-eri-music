const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const userController = require('../controllers/userController');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', catchErrors(storeController.musicStore));
router.get('/musicStore', catchErrors(storeController.musicStore));
router.get('/musicStore/page/:page', catchErrors(storeController.musicStore));
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post('/add',
 storeController.upload,
 catchErrors(storeController.postmusic),
 catchErrors(storeController.resize),
 catchErrors(storeController.createStore)
);

router.post('/add/:id',
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore)
);
router.get('/musicStore/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.delete('/musicStore/:id', catchErrors(storeController.deleteStore));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);
router.post('/register',
userController.validateRegister,
userController.register,
authController.login);

router.get('/logout', authController.logout);
router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

router.post('/reviews/:id',
authController.isLoggedIn,
catchErrors(reviewController.addReview)
);

/*
  API
*/

router.get('/api/search', catchErrors(storeController.searchStores));


module.exports = router;
