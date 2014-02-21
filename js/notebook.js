var DROPBOX_APP_KEY = 'wy9kcn6i5kkgrrf';
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var Table;
var idn, ident;
$(function(){

    function show_edit_page()
	{
	     $('#for_note').hide();
	     $('#for_edit').show();
	}
	function show_main_page()
	{
	     $('#for_note').show();
	     $('#for_edit').hide();
	}
	
// The login button will start the authentication process.
	$('#loginButton').click(function (e) {
		e.preventDefault();
		// This will redirect the browser to OAuth login.
		client.authenticate();
	});

	// Try to finish OAuth authorization.
	client.authenticate({interactive:false}, function (error) {
		if (error) {
			alert('Authentication error: ' + error);
		}
	});

	if (client.isAuthenticated()) {
		// Client is authenticated. Display UI.
		$('#loginButton').hide();
		$('#edit_button').hide();

		client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
			if (error) {
				alert('Error opening default datastore: ' + error);
			}
		
			Table = datastore.getTable('Notes');
			// Populate the initial task list.
			updateList();
			// Ensure that future changes update the list.
			datastore.recordsChanged.addListener(updateList);
		});
	}
	function insertNote(note_name, text) {
		Table.insert({
			name: note_name,
			content: text,
			modified: new Date() });
	}
	
	function updateList() {
		$('#notes_list').empty();

		var records = Table.query();

		// Sort by creation time.
		records.sort(function (note_A, note_B) {
			if (note_A.get('modified') < note_B.get('modified')) return -1;
			if (note_A.get('modified') > note_B.get('modified')) return 1;
			return 0;
		});
		
		if(records.length>0)
		{
         $('#em').hide();
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			$('#notes_list').append(
				renderNote(record.getId(),
					record.get('name')));
		}
		}
		else $('#em').show();
        $('#n').hide();
		addListeners();
		$('#newNote').focus();
	}
	
	function renderNote(id, name) {
	    var n = '&nbsp &nbsp'+name;
		return $('<li>').attr('id', id).append(
				$('<input>').attr('type', 'checkbox')
			).append(
				$('<a>').addClass('cl').html(n));

	}
	
	function show_note(id)
	{ 
	   $('#for_note1').empty();
	   $('#l1').empty();
	   $('#edit_button').show();
	   
	   var records = Table.query();
	   for (var i = 0; i < records.length; i++)
	   {
	      var record = records[i];
		  if(record.getId()==id) 
	   {
	   $('#for_note1').append(record.get('content'));
	   $('#l1').append(record.get('name'));
	   
	   break;
	   }
	   }
	}
	
	function deleteRecord(id) {
		Table.get(id).deleteRecord();
	}

	$('#add_note').click(function(e){
	    // e.preventDefault();
		 ident=0;
	     $('#edit_time').empty();
		 $('#newNote').val('');
		 $('#newText').val('');
		 show_edit_page();
	});
	
	$('#edit_button').click(function(e){
	//	e.preventDefault();
		edit_note(idn);
		show_edit_page();
		ident=1;
	});
	
	$('#save').click(function(e){
		//e.preventDefault();
		if(ident==1) change_note(idn);
		else add_new_note();});
		
	$('#exit').click(function(e){
	    // e.preventDefault();
		 show_main_page();
		 if(ident==1) 
		{
		show_note(idn);
		ident=0;
		}
    });	
	
	$('#del_note').click(function (e){
	});
	
	function addListeners() {

		$('button.delete').click(function (e) {
			//e.preventDefault();
			var id = $(this).parents('li').attr('id');
			deleteRecord(id);
		});
		
	$('a.cl').click(function(e){
		//e.preventDefault();
		show_main_page();
	    idn=$(this).parents('li').attr('id');
		show_note(idn);
	});
	
	} 
	
	function change_note(id)
	{ 

	    if ($('#newNote').val().length > 0) {
		    if($('#newText').val().length>0)
			{
			var v1, v2, v3;
			v1=$('#newNote').val();
			v2=$('#newText').val();
			v3=new Date();
			Table.get(id).set('name', v1);
			Table.get(id).set('content', v2);
			Table.get(id).set('modified', v3);
			}
			else alert('text not found. change');
		}
		else alert('name not found. change');
  	return false;
	}
	
	function edit_note(id)
	{
	   $('#newText').val('');
	   $('#newNote').val('');
	   $('#edit_time').empty();
	   var records = Table.query();
	   for (var i = 0; i < records.length; i++)
	   {
	      var record = records[i];
		  if(record.getId()==id) 
	   {
	   var v11, v21, v31;
	   v11=record.get('content');
	   v21=record.get('name');
	   v31=record.get('modified').toString();
	   $('#newText').val(v11);
	   $('#newNote').val(v21);
	   $('#edit_time').append(v31);
	   break;
	   }
	   }
	}
	
	function add_new_note()
	{
	   if ($('#newNote').val().length > 0) {
		    if($('#newText').val().length>0)
			{
			insertNote($('#newNote').val(), $('#newText').val());
			$('#newNote').val('');
			$('#newText').val('');
			}
			else alert('text not found. add');
		}
		else alert('name not found. add');
		return false;
	}
	
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