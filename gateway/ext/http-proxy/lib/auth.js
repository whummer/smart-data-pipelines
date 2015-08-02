// helper file for user authentication

var Auth = function( options ){
	this.options = options;

	this.routes = options.routes || {
		authorize: "/oauth/authorize",
		token: "/oauth/token"
	};
}


Auth.prototype = {

	login: function( type ){
		type = type || "code";
		var url = this.options.api + this.routes.authorize;
		return '<html><body><button><a href="'+ url +'?client_id='+ this.options.app.client_id +'&response_type='+ type +'&redirect_uri=http://localhost:8000/auth/'+ type +'">Click to login</a></button></body></html>'
	},

	token: function( code ){
		var url = this.options.api + ( this.routes.token || this.routes.access_token );
		return url +'?grant_type=authorization_code&code='+ code +'&client_id='+ this.options.app.client_id +'&client_secret='+ this.options.app.client_secret +'&redirect_uri=http://localhost:8000/auth/token';
	},

	dialog: function( req ){

		var user_id = "myid"; // this comes from the session...

		var form = '<p>Usually here we check the session and ask the user to login if needed. But for simplicity just accept or deny the request below:</p>';

		form += '<form action="'+ this.routes.authorize +'"><input type="hidden" name="user_id" value="'+ user_id +'"><input type="hidden" name="oauth_params" value="'+ req.oauth.params +'"><input type="hidden" name="grant" value="1"><input type="submit" value="Accept"></form>';

		form += '<form action="'+ this.routes.authorize +'"><input type="hidden" name="user_id" value="'+ user_id +'"><input type="hidden" name="oauth_params" value="'+ req.oauth.params +'"><input type="hidden" name="grant" value="0"><input type="submit" value="Deny"></form>'

		return form;
	}

}

module.exports = Auth;