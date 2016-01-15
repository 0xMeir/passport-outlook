# passport-outlook2
####npm -i --save passport-outlook2


Based on Jared Hanson's passport-windowslive strategy, with a mofification to retrieve the outlook profile instead of the windows live profile. 

Following this example: https://oauthplay.azurewebsites.net/


Example Usage
```js

passport.use(new WindowsLiveStrategy({
    clientID: configAuth.windowsliveAuth.appId,
    clientSecret: configAuth.windowsliveAuth.password,
    callbackURL: configAuth.windowsliveAuth.callbackURL,
    passReqToCallback : true
  },
  function(req, token, refreshToken, profile, done) {
    var userid = req.user;
    User.findById(userid, function (err, user) {
        if (err || !user){
            console.log("db err")
            return done(null, false, req.flash('message', 'DB error'));
        } else {
            if (profile.EmailAddress){
            	user.outlook.email = profile.EmailAddress;
                user.outlook.token=token;
                user.outlook.refreshToken=refreshToken;
                if (profile.MailboxGuid){
                	user.outlook.mailboxGuid = profile.MailboxGuid;
                }
                if (profile.Alias){
                	user.outlook.alias = profile.Alias;
                }
                if (profile.Id){
                user.outlook.id = profile.Id

                }
                user.save(function(err){
                    if (err){
                        return done(null, false, req.flash('message', 'DB error'));
                    } else {
                        return done(null, user);
                    }
                });
            } else {
                return done(null, false, req.flash('message', 'No email account detected with this account.'));
            }
        }
    });
    
    
  }
));
```