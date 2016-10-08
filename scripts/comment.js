var Comment = React.createClass({
	rawMarkUp: function() {
		var md = new Remarkable();
		var rawMarkUp = md.render(this.props.children.toString());
		return {__html: rawMarkUp};
	},

	render: function() {
		return (
			<div>
				<h2>{this.props.author}</h2>
				<span dangerouslySetInnerHTML={this.rawMarkUp()} />
			</div>
			);
	}
});

var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.comments.map(function(comment) {
			return (
				<Comment author={comment.author} key={comment.id}>
					{comment.content}
				</Comment>
			);
		});
		return (
			<div>
				{commentNodes}
			</div>
		);
	}
});

var CommentForm = React.createClass({
	getInitialState: function() {
		return {
			author: '',
			content: ''
		};
	},

	handleAuthorChange: function(e) {
		this.setState({author: e.target.value});
	},

	handleContentChange: function(e) {
		this.setState({content: e.target.value});
	},

	handleSubmit: function(e) {
		e.preventDefault();
		var author = this.state.author.trim();
		var content = this.state.content.trim();
		if(!author || !content)	return;

		this.props.onSubmitComment({author: author, content: content});
		this.setState({author:'', content:''});
	},

	render: function() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					placeholder = "your name"
					type = "text"
					value = {this.state.author}
					onChange = {this.handleAuthorChange}
				/>
				<input
					placeholder = "your comment"
					type = "text"
					value = {this.state.content}
					onChange = {this.handleContentChange}
				/>
				<input type = "submit" value = "post" />
			</form>
		);
	}
})


var CommentBox = React.createClass({
	getInitialState: function() {
		return {comments: []};
	},

	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			success: function(comments) {
				this.setState({comments: comments});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err);
			}.bind(this)
		});
	},

	componentDidMount: function() {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},

	handleSubmitComment: function(comment) {
		comment.id = Date.now();
		var newComments = this.state.comments.concat([comment]);
		this.setState({comments: newComments});
		$.ajax({
			url: this.props.url,
			type: 'POST',
			data: comment,
			dataType: 'json',
			success: function(comments) {
				this.setState({comments: comments});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err);
			}.bind(this)
		});
	},

	render: function() {
		return (
			<div>
				<h1>Comments</h1>
				<CommentList comments = {this.state.comments} />
				<CommentForm onSubmitComment = {this.handleSubmitComment} />
			</div>
			);
	}
});

ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000} />,
	document.getElementById('content')
);