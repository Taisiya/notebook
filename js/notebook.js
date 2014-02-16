var DROPBOX_APP_KEY = 'wy9kcn6i5kkgrrf';
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
$(function(){
// The login button will start the authentication process.
	$('#loginButton').click(function (e) {
		e.preventDefault();
		// This will redirect the browser to OAuth login.
		client.authenticate();
	});

	// Try to finish OAuth authorization.//false 
	client.authenticate({interactive:false}, function (error) {
		if (error) {
			alert('Authentication error: ' + error);
		}
		else alert('ok');
	});

	if (client.isAuthenticated()) {
		// Client is authenticated. Display UI.
		$('#loginButton').hide();
		$('#m').show();

		client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
			if (error) {
				alert('Error opening default datastore: ' + error);
			}
			else alert('It is all right');

		/*	taskTable = datastore.getTable('tasks');

			// Populate the initial task list.
			updateList();

			// Ensure that future changes update the list.
			datastore.recordsChanged.addListener(updateList);*/
		});
	}
	if(!client.isAuthenticated()) {alert('not ok ');}


/*var Note=Backbone.Model.extend({
EMPTY:
{
  text:'none',
  last_modified:'none',
}
initialize: function(){
if(!this.get("content")){this.set({"content": this.EMPTY});}
},//init

});//model*/

});//$(function()