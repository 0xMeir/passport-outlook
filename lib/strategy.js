/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , LiveConnectAPIError = require('./errors/liveconnectapierror')
  , request=require('request');


/**
 * `Strategy` constructor.
 *
 * The Windows Live authentication strategy authenticates requests by delegating
 * to Windows Live using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Windows Live application's client ID
 *   - `clientSecret`  your Windows Live application's client secret
 *   - `callbackURL`   URL to which Windows Live will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new WindowsLiveStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/windowslive/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.live.com/oauth20_authorize.srf';
  options.tokenURL = options.tokenURL || 'https://login.live.com/oauth20_token.srf';
  //console.log("OPTIONS",options)
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'windowslive';
  this._userProfileURL = options.userProfileURL || 'https://outlook.office.com/api/v2.0/me';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Windows Live.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `windowslive`
 *   - `id`               the user's Windows Live ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  //this._oauth2.getProtectedResource(this._userProfileURL, accessToken, function (err, body, res) {

  request.get({url: this._userProfileURL, headers:{'Authorization':'Bearer '+accessToken, 'Accept': 'application/json; odata.metadata=none'}},  function (err,res, body) {
    console.log(err, body, res)
    var json;
    
    if (err) {
      console.log(err, body, res)
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
        
      if (json && json.error) {
        console.log(accessToken)
        return done(new LiveConnectAPIError(json.error.message, json.error.code));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile =json;
    profile.provider  = 'windowslive';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
