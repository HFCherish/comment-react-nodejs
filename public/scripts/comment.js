var Comment = React.createClass({
	rawMarkup: function() {
		var md = new Remarkable();
		return {__html: md.render(this.props.children.toString())};
	},

	render: function() {
		return (
				<div>
					<h2>{this.props.author}</h2>
					<span dangerouslySetInnerHTML={this.rawMarkup()} />
				</div>
			);
	}
});

var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.comments.map(comment => {
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
		return {author: '', content: ''};
	},

	handleAuhtorChange: function(e) {
		this.setState({author: e.target.value});
	},

	handleContentChange: function(e) {
		this.setState({content: e.target.value});
	},

	handleSubmit: function(e) {
		e.preventDefault();
		var author = this.state.author;
		var content = this.state.content;
		if(!author || !content) return;
		this.props.onCommentSubmit({author:author, content:content});
		this.setState({author:'', content:''});
	},

	render: function() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input type='text' value={this.state.author} placeholder='your name' onChange={this.handleAuhtorChange} />
				<input type='text' value={this.state.content} placeholder='your content' onChange={this.handleContentChange} />
				<input type='submit' value='post' />
			</form>
		);
	}
});

var CommentBox = React.createClass({
	getInitialState: function() {
		return {comments: []};
	},

	componentDidMount: function() {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},

	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(comments) {
				this.setState({comments: comments});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}
		});
	},

	handleCommentSubmit: function(comment) {
		comment.id = Date.now();
		this.setState({comments: this.state.comments.concat([comment])});
		$.ajax({
			url: this.props.url,
			type: 'POST',
			data: comment,
			dataType: 'json',
			success: function(comments) {
				this.setState({comments:comments});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}
		});
	},

	render: function() {
		return (
			<div>
				<h1>Comments</h1>
				<CommentList comments={this.state.comments} />
				<CommentForm onCommentSubmit={this.handleCommentSubmit} />
			</div>
		);
	}
});

ReactDOM.render(
	<CommentBox url='/api/comments' pollInterval={2000} />,
	document.getElementById('content')
);