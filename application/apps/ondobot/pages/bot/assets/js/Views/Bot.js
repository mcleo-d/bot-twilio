Package('Ondobot.Views', {
	Bot : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			$('#create-bot').click(this.onCreateClick.bind(this));
			$('#update-bot').click(this.onUpdateClick.bind(this));
			$('#show-public-input').change(this.onShowPublicChange.bind(this));
			this.includePublic = false;
		},

		drawScripts : function(container, scripts, onCheck)
		{
			container.empty();

			scripts.each(function(script)
			{
				var template = SAPPHIRE.templates.get('bot-script-item');
				template.find('#bot-script-name').text(script.name);
				template.find('#use-script').click(onCheck.bind(this, script));
				template.attr('data-id', script.id);

				container.append(template);
			}, this);
		},

		drawUsedScripts : function()
		{
			var container = $('#bot-script-list');
			container.empty();
			var scripts = [];

			this.bot.scriptLinks.each(function(scriptId) {
				var script = this.indexedScripts[scriptId];
				if (!script) return;
				scripts.push(script);
			}, this);

			this.drawScripts(container, scripts, this.onStopUsing);
			$('#bot-script-list').sortable();
		},

		drawUnusedScripts : function(includePublic)
		{
			var scripts = [];
			Object.each(this.indexedScripts, function(script)
			{
				if (this.bot.scriptLinks.indexOf(script.id) !== -1) return;
				if (script.public && includePublic || !script.public)
					scripts.push(script);
			}, this);

			scripts.sort(function(a, b)
			{
				var aStr = a.name.toLowerCase();
				var bStr = b.name.toLowerCase();

				return aStr.localeCompare(bStr)
			});

			var container = $('#unused-script-list');
			this.drawScripts(container, scripts, this.onStartUsing);
		},

		indexScripts : function(scripts, publicScripts)
		{
			this.indexedScripts = {};
			scripts.each(function(script)
			{
				this.indexedScripts[script.id] = script;
			}.bind(this));

			publicScripts.each(function(script)
			{
				this.indexedScripts[script.id] = script;
			}.bind(this));
		},

		draw : function(bot, scripts, publicScripts)
		{
			console.log('draw', arguments);

			this.bot = bot;

			$('#bot-page').removeClass('bot-create bot-edit');

			if (!bot) $('#bot-page').addClass('bot-create');
			else
			{
				this.indexScripts(scripts, publicScripts);
				this.drawUsedScripts();
				this.drawUnusedScripts(this.includePublic);
				$('#bot-page').addClass('bot-edit');
				$('#bot-name-value').html(bot.userName);
				$('#read-delay-input').val(bot.options.readDelaySeconds);
				$('#typing-speed-input').val(bot.options.typingSpeed);
				$('#self-spam-input').val(bot.options.selfSpamSeconds);
				$('#other-spam-input').val(bot.options.otherSpamSeconds);
			}
		},

		onSaveClick : function()
		{
			var user;

			this.fire('save', user, password);
		},

		onCreateClick : function()
		{
			var cert = $('#bot-chain-input').val();
			var key = $('#bot-key-input').val();
			var passphrase = $('#passphrase-input').val();

			this.fire('create', cert, key, passphrase);
		},

		onStopUsing : function(script)
		{
			var idx = this.bot.scriptLinks.indexOf(script.id);
			if (idx === -1) return;
			this.bot.scriptLinks.splice(idx, 1);
			this.drawUsedScripts();
			this.drawUnusedScripts(this.includePublic);
		},

		onStartUsing : function(script)
		{
			this.bot.scriptLinks.push(script.id);
			this.drawUsedScripts();
			this.drawUnusedScripts(this.includePublic);
		},

		onShowPublicChange : function()
		{
			this.includePublic = $('#show-public-input').prop('checked');
			this.drawUnusedScripts(this.includePublic);
		},

		getValue : function(str, def)
		{
			val = parseInt(str);
			if (isNaN(val)) return def;
			if (val < 0) return def;
			return val;
		},

		onUpdateClick : function()
		{
			var scripts = [];
			$('#bot-script-list li').each(function(which, el)
			{
				var jEl = $(el);
				var script = jEl.attr('data-id');
				scripts.push(script);
			}.bind(this));

			this.bot.scriptLinks = scripts;
			this.bot.options.otherSpamSeconds = this.getValue($('#other-spam-input').val(), this.bot.options.otherSpamSeconds);
			this.bot.options.readDelaySeconds = this.getValue($('#read-delay-input').val(), this.bot.options.readDelaySeconds);
			this.bot.options.selfSpamSeconds = this.getValue($('#self-spam-input').val(), this.bot.options.selfSpamSeconds);
			this.bot.options.typingSpeed = this.getValue($('#typing-speed-input').val(), this.bot.options.typingSpeed);

			this.fire('update', this.bot);
		}
	})
});
