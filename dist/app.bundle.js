/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _papaparse = __webpack_require__(1);

	var Papa = _interopRequireWildcard(_papaparse);

	var _fileSaver = __webpack_require__(2);

	var _underscore = __webpack_require__(5);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	if (typeof window !== 'undefined') {
		document.addEventListener("dragenter", function (event) {

			event.stopPropagation();
			event.preventDefault();
		}, false);

		document.addEventListener("dragover", function (event) {
			event.stopPropagation();
			event.preventDefault();
		}, false);

		document.addEventListener("drop", function (event) {
			event.stopPropagation();
			event.preventDefault();

			var input = event.dataTransfer.files[0];

			document.querySelector('.converting-bar').classList.add('active');

			window.setTimeout(function handleDrop(event) {
				var data = [],
				    output = '',
				    rows = 0,
				    skipped = [],
				    status = document.getElementById('output');

				Papa.parse(input, {
					header: true,
					skipEmptyLines: true,
					step: function step(row) {

						rows++;

						try {
							var r = row.data[0],
							    type = r.product_type.split(' > '),
							    grams = parseInt(r.shipping_weight.replace(' lbs', ''), 10) * 453.592;

							data.push([(0, _underscore.slugify)(r.title), r.title, '', r.brand, type[0], type.join(' ').toLowerCase(), 'TRUE', 'Title', 'Default Title', '', '', '', '', '', grams, '', 1, 'continue', '', r.price.replace(' USD', ''), '', 'TRUE', 'TRUE', '', r.image_link, 'Image of ' + r.title, 'FALSE', r.mpn, (0, _underscore.capitalize)(r.age_group), (0, _underscore.capitalize)(r.gender), r.google_product_category, (0, _underscore.prune)(r.title + ' for sale', 66), (0, _underscore.prune)(r.description, 156), type[0], type.join(', ').toLowerCase(), 'new', 'TRUE', '', '', '', '', '', 'lb']);
						} catch (e) {
							console.log(row);
							skipped.push(row);
						}
					},
					complete: function complete() {

						output = Papa.unparse({
							fields: ["Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published", "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value", "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Alt Text", "Gift Card", "Google Shopping / MPN", "Google Shopping / Age Group", "Google Shopping / Gender", "Google Shopping / Google Product Category", "SEO Title", "SEO Description", "Google Shopping / AdWords Grouping", "Google Shopping / AdWords Labels", "Google Shopping / Condition", "Google Shopping / Custom Product", "Google Shopping / Custom Label 0", "Google Shopping / Custom Label 1", "Google Shopping / Custom Label 2", "Google Shopping / Custom Label 3", "Google Shopping / Custom Label 4", "Variant Image", "Variant Weight Unit"],
							data: data
						});

						status.textContent = 'Here\'s your file. (' + rows + ' rows | ' + skipped.length + ' skipped)';
						document.querySelector('.converting-bar').classList.remove('active');
						document.querySelector('.results').classList.add('finished');

						window.setTimeout(function () {
							var blob = new Blob([output], { type: "text/csv;charset=utf-8" });
							(0, _fileSaver.saveAs)(blob, "shopifile.csv");
						}, 350);
					}
				});
			}, 500);
		}, false);
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
		Papa Parse
		v4.1.2
		https://github.com/mholt/PapaParse
	*/
	(function(global)
	{
		"use strict";

		var IS_WORKER = !global.document && !!global.postMessage,
			IS_PAPA_WORKER = IS_WORKER && /(\?|&)papaworker(=|&|$)/.test(global.location.search),
			LOADED_SYNC = false, AUTO_SCRIPT_PATH;
		var workers = {}, workerIdCounter = 0;

		var Papa = {};

		Papa.parse = CsvToJson;
		Papa.unparse = JsonToCsv;

		Papa.RECORD_SEP = String.fromCharCode(30);
		Papa.UNIT_SEP = String.fromCharCode(31);
		Papa.BYTE_ORDER_MARK = "\ufeff";
		Papa.BAD_DELIMITERS = ["\r", "\n", "\"", Papa.BYTE_ORDER_MARK];
		Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
		Papa.SCRIPT_PATH = null;	// Must be set by your code if you use workers and this lib is loaded asynchronously

		// Configurable chunk sizes for local and remote files, respectively
		Papa.LocalChunkSize = 1024 * 1024 * 10;	// 10 MB
		Papa.RemoteChunkSize = 1024 * 1024 * 5;	// 5 MB
		Papa.DefaultDelimiter = ",";			// Used if not specified and detection fails

		// Exposed for testing and development only
		Papa.Parser = Parser;
		Papa.ParserHandle = ParserHandle;
		Papa.NetworkStreamer = NetworkStreamer;
		Papa.FileStreamer = FileStreamer;
		Papa.StringStreamer = StringStreamer;

		if (typeof module !== 'undefined' && module.exports)
		{
			// Export to Node...
			module.exports = Papa;
		}
		else if (isFunction(global.define) && global.define.amd)
		{
			// Wireup with RequireJS
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return Papa; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else
		{
			// ...or as browser global
			global.Papa = Papa;
		}

		if (global.jQuery)
		{
			var $ = global.jQuery;
			$.fn.parse = function(options)
			{
				var config = options.config || {};
				var queue = [];

				this.each(function(idx)
				{
					var supported = $(this).prop('tagName').toUpperCase() == "INPUT"
									&& $(this).attr('type').toLowerCase() == "file"
									&& global.FileReader;

					if (!supported || !this.files || this.files.length == 0)
						return true;	// continue to next input element

					for (var i = 0; i < this.files.length; i++)
					{
						queue.push({
							file: this.files[i],
							inputElem: this,
							instanceConfig: $.extend({}, config)
						});
					}
				});

				parseNextFile();	// begin parsing
				return this;		// maintains chainability


				function parseNextFile()
				{
					if (queue.length == 0)
					{
						if (isFunction(options.complete))
							options.complete();
						return;
					}

					var f = queue[0];

					if (isFunction(options.before))
					{
						var returned = options.before(f.file, f.inputElem);

						if (typeof returned === 'object')
						{
							if (returned.action == "abort")
							{
								error("AbortError", f.file, f.inputElem, returned.reason);
								return;	// Aborts all queued files immediately
							}
							else if (returned.action == "skip")
							{
								fileComplete();	// parse the next file in the queue, if any
								return;
							}
							else if (typeof returned.config === 'object')
								f.instanceConfig = $.extend(f.instanceConfig, returned.config);
						}
						else if (returned == "skip")
						{
							fileComplete();	// parse the next file in the queue, if any
							return;
						}
					}

					// Wrap up the user's complete callback, if any, so that ours also gets executed
					var userCompleteFunc = f.instanceConfig.complete;
					f.instanceConfig.complete = function(results)
					{
						if (isFunction(userCompleteFunc))
							userCompleteFunc(results, f.file, f.inputElem);
						fileComplete();
					};

					Papa.parse(f.file, f.instanceConfig);
				}

				function error(name, file, elem, reason)
				{
					if (isFunction(options.error))
						options.error({name: name}, file, elem, reason);
				}

				function fileComplete()
				{
					queue.splice(0, 1);
					parseNextFile();
				}
			}
		}


		if (IS_PAPA_WORKER)
		{
			global.onmessage = workerThreadReceivedMessage;
		}
		else if (Papa.WORKERS_SUPPORTED)
		{
			AUTO_SCRIPT_PATH = getScriptPath();

			// Check if the script was loaded synchronously
			if (!document.body)
			{
				// Body doesn't exist yet, must be synchronous
				LOADED_SYNC = true;
			}
			else
			{
				document.addEventListener('DOMContentLoaded', function () {
					LOADED_SYNC = true;
				}, true);
			}
		}




		function CsvToJson(_input, _config)
		{
			_config = _config || {};

			if (_config.worker && Papa.WORKERS_SUPPORTED)
			{
				var w = newWorker();

				w.userStep = _config.step;
				w.userChunk = _config.chunk;
				w.userComplete = _config.complete;
				w.userError = _config.error;

				_config.step = isFunction(_config.step);
				_config.chunk = isFunction(_config.chunk);
				_config.complete = isFunction(_config.complete);
				_config.error = isFunction(_config.error);
				delete _config.worker;	// prevent infinite loop

				w.postMessage({
					input: _input,
					config: _config,
					workerId: w.id
				});

				return;
			}

			var streamer = null;
			if (typeof _input === 'string')
			{
				if (_config.download)
					streamer = new NetworkStreamer(_config);
				else
					streamer = new StringStreamer(_config);
			}
			else if ((global.File && _input instanceof File) || _input instanceof Object)	// ...Safari. (see issue #106)
				streamer = new FileStreamer(_config);

			return streamer.stream(_input);
		}






		function JsonToCsv(_input, _config)
		{
			var _output = "";
			var _fields = [];

			// Default configuration

			/** whether to surround every datum with quotes */
			var _quotes = false;

			/** delimiting character */
			var _delimiter = ",";

			/** newline character(s) */
			var _newline = "\r\n";

			unpackConfig();

			if (typeof _input === 'string')
				_input = JSON.parse(_input);

			if (_input instanceof Array)
			{
				if (!_input.length || _input[0] instanceof Array)
					return serialize(null, _input);
				else if (typeof _input[0] === 'object')
					return serialize(objectKeys(_input[0]), _input);
			}
			else if (typeof _input === 'object')
			{
				if (typeof _input.data === 'string')
					_input.data = JSON.parse(_input.data);

				if (_input.data instanceof Array)
				{
					if (!_input.fields)
						_input.fields = _input.data[0] instanceof Array
										? _input.fields
										: objectKeys(_input.data[0]);

					if (!(_input.data[0] instanceof Array) && typeof _input.data[0] !== 'object')
						_input.data = [_input.data];	// handles input like [1,2,3] or ["asdf"]
				}

				return serialize(_input.fields || [], _input.data || []);
			}

			// Default (any valid paths should return before this)
			throw "exception: Unable to serialize unrecognized input";


			function unpackConfig()
			{
				if (typeof _config !== 'object')
					return;

				if (typeof _config.delimiter === 'string'
					&& _config.delimiter.length == 1
					&& Papa.BAD_DELIMITERS.indexOf(_config.delimiter) == -1)
				{
					_delimiter = _config.delimiter;
				}

				if (typeof _config.quotes === 'boolean'
					|| _config.quotes instanceof Array)
					_quotes = _config.quotes;

				if (typeof _config.newline === 'string')
					_newline = _config.newline;
			}


			/** Turns an object's keys into an array */
			function objectKeys(obj)
			{
				if (typeof obj !== 'object')
					return [];
				var keys = [];
				for (var key in obj)
					keys.push(key);
				return keys;
			}

			/** The double for loop that iterates the data and writes out a CSV string including header row */
			function serialize(fields, data)
			{
				var csv = "";

				if (typeof fields === 'string')
					fields = JSON.parse(fields);
				if (typeof data === 'string')
					data = JSON.parse(data);

				var hasHeader = fields instanceof Array && fields.length > 0;
				var dataKeyedByField = !(data[0] instanceof Array);

				// If there a header row, write it first
				if (hasHeader)
				{
					for (var i = 0; i < fields.length; i++)
					{
						if (i > 0)
							csv += _delimiter;
						csv += safe(fields[i], i);
					}
					if (data.length > 0)
						csv += _newline;
				}

				// Then write out the data
				for (var row = 0; row < data.length; row++)
				{
					var maxCol = hasHeader ? fields.length : data[row].length;

					for (var col = 0; col < maxCol; col++)
					{
						if (col > 0)
							csv += _delimiter;
						var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
						csv += safe(data[row][colIdx], col);
					}

					if (row < data.length - 1)
						csv += _newline;
				}

				return csv;
			}

			/** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */
			function safe(str, col)
			{
				if (typeof str === "undefined" || str === null)
					return "";

				str = str.toString().replace(/"/g, '""');

				var needsQuotes = (typeof _quotes === 'boolean' && _quotes)
								|| (_quotes instanceof Array && _quotes[col])
								|| hasAny(str, Papa.BAD_DELIMITERS)
								|| str.indexOf(_delimiter) > -1
								|| str.charAt(0) == ' '
								|| str.charAt(str.length - 1) == ' ';

				return needsQuotes ? '"' + str + '"' : str;
			}

			function hasAny(str, substrings)
			{
				for (var i = 0; i < substrings.length; i++)
					if (str.indexOf(substrings[i]) > -1)
						return true;
				return false;
			}
		}

		/** ChunkStreamer is the base prototype for various streamer implementations. */
		function ChunkStreamer(config)
		{
			this._handle = null;
			this._paused = false;
			this._finished = false;
			this._input = null;
			this._baseIndex = 0;
			this._partialLine = "";
			this._rowCount = 0;
			this._start = 0;
			this._nextChunk = null;
			this.isFirstChunk = true;
			this._completeResults = {
				data: [],
				errors: [],
				meta: {}
			};
			replaceConfig.call(this, config);

			this.parseChunk = function(chunk)
			{
				// First chunk pre-processing
				if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk))
				{
					var modifiedChunk = this._config.beforeFirstChunk(chunk);
					if (modifiedChunk !== undefined)
						chunk = modifiedChunk;
				}
				this.isFirstChunk = false;

				// Rejoin the line we likely just split in two by chunking the file
				var aggregate = this._partialLine + chunk;
				this._partialLine = "";

				var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);
				
				if (this._handle.paused() || this._handle.aborted())
					return;
				
				var lastIndex = results.meta.cursor;
				
				if (!this._finished)
				{
					this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
					this._baseIndex = lastIndex;
				}

				if (results && results.data)
					this._rowCount += results.data.length;

				var finishedIncludingPreview = this._finished || (this._config.preview && this._rowCount >= this._config.preview);

				if (IS_PAPA_WORKER)
				{
					global.postMessage({
						results: results,
						workerId: Papa.WORKER_ID,
						finished: finishedIncludingPreview
					});
				}
				else if (isFunction(this._config.chunk))
				{
					this._config.chunk(results, this._handle);
					if (this._paused)
						return;
					results = undefined;
					this._completeResults = undefined;
				}

				if (!this._config.step && !this._config.chunk) {
					this._completeResults.data = this._completeResults.data.concat(results.data);
					this._completeResults.errors = this._completeResults.errors.concat(results.errors);
					this._completeResults.meta = results.meta;
				}

				if (finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted))
					this._config.complete(this._completeResults);

				if (!finishedIncludingPreview && (!results || !results.meta.paused))
					this._nextChunk();

				return results;
			};

			this._sendError = function(error)
			{
				if (isFunction(this._config.error))
					this._config.error(error);
				else if (IS_PAPA_WORKER && this._config.error)
				{
					global.postMessage({
						workerId: Papa.WORKER_ID,
						error: error,
						finished: false
					});
				}
			};

			function replaceConfig(config)
			{
				// Deep-copy the config so we can edit it
				var configCopy = copy(config);
				configCopy.chunkSize = parseInt(configCopy.chunkSize);	// parseInt VERY important so we don't concatenate strings!
				if (!config.step && !config.chunk)
					configCopy.chunkSize = null;  // disable Range header if not streaming; bad values break IIS - see issue #196
				this._handle = new ParserHandle(configCopy);
				this._handle.streamer = this;
				this._config = configCopy;	// persist the copy to the caller
			}
		}


		function NetworkStreamer(config)
		{
			config = config || {};
			if (!config.chunkSize)
				config.chunkSize = Papa.RemoteChunkSize;
			ChunkStreamer.call(this, config);

			var xhr;

			if (IS_WORKER)
			{
				this._nextChunk = function()
				{
					this._readChunk();
					this._chunkLoaded();
				};
			}
			else
			{
				this._nextChunk = function()
				{
					this._readChunk();
				};
			}

			this.stream = function(url)
			{
				this._input = url;
				this._nextChunk();	// Starts streaming
			};

			this._readChunk = function()
			{
				if (this._finished)
				{
					this._chunkLoaded();
					return;
				}

				xhr = new XMLHttpRequest();
				
				if (!IS_WORKER)
				{
					xhr.onload = bindFunction(this._chunkLoaded, this);
					xhr.onerror = bindFunction(this._chunkError, this);
				}

				xhr.open("GET", this._input, !IS_WORKER);
				
				if (this._config.chunkSize)
				{
					var end = this._start + this._config.chunkSize - 1;	// minus one because byte range is inclusive
					xhr.setRequestHeader("Range", "bytes="+this._start+"-"+end);
					xhr.setRequestHeader("If-None-Match", "webkit-no-cache"); // https://bugs.webkit.org/show_bug.cgi?id=82672
				}

				try {
					xhr.send();
				}
				catch (err) {
					this._chunkError(err.message);
				}

				if (IS_WORKER && xhr.status == 0)
					this._chunkError();
				else
					this._start += this._config.chunkSize;
			}

			this._chunkLoaded = function()
			{
				if (xhr.readyState != 4)
					return;

				if (xhr.status < 200 || xhr.status >= 400)
				{
					this._chunkError();
					return;
				}

				this._finished = !this._config.chunkSize || this._start > getFileSize(xhr);
				this.parseChunk(xhr.responseText);
			}

			this._chunkError = function(errorMessage)
			{
				var errorText = xhr.statusText || errorMessage;
				this._sendError(errorText);
			}

			function getFileSize(xhr)
			{
				var contentRange = xhr.getResponseHeader("Content-Range");
				return parseInt(contentRange.substr(contentRange.lastIndexOf("/") + 1));
			}
		}
		NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
		NetworkStreamer.prototype.constructor = NetworkStreamer;


		function FileStreamer(config)
		{
			config = config || {};
			if (!config.chunkSize)
				config.chunkSize = Papa.LocalChunkSize;
			ChunkStreamer.call(this, config);

			var reader, slice;

			// FileReader is better than FileReaderSync (even in worker) - see http://stackoverflow.com/q/24708649/1048862
			// But Firefox is a pill, too - see issue #76: https://github.com/mholt/PapaParse/issues/76
			var usingAsyncReader = typeof FileReader !== 'undefined';	// Safari doesn't consider it a function - see issue #105

			this.stream = function(file)
			{
				this._input = file;
				slice = file.slice || file.webkitSlice || file.mozSlice;

				if (usingAsyncReader)
				{
					reader = new FileReader();		// Preferred method of reading files, even in workers
					reader.onload = bindFunction(this._chunkLoaded, this);
					reader.onerror = bindFunction(this._chunkError, this);
				}
				else
					reader = new FileReaderSync();	// Hack for running in a web worker in Firefox

				this._nextChunk();	// Starts streaming
			};

			this._nextChunk = function()
			{
				if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview))
					this._readChunk();
			}

			this._readChunk = function()
			{
				var input = this._input;
				if (this._config.chunkSize)
				{
					var end = Math.min(this._start + this._config.chunkSize, this._input.size);
					input = slice.call(input, this._start, end);
				}
				var txt = reader.readAsText(input, this._config.encoding);
				if (!usingAsyncReader)
					this._chunkLoaded({ target: { result: txt } });	// mimic the async signature
			}

			this._chunkLoaded = function(event)
			{
				// Very important to increment start each time before handling results
				this._start += this._config.chunkSize;
				this._finished = !this._config.chunkSize || this._start >= this._input.size;
				this.parseChunk(event.target.result);
			}

			this._chunkError = function()
			{
				this._sendError(reader.error);
			}

		}
		FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
		FileStreamer.prototype.constructor = FileStreamer;


		function StringStreamer(config)
		{
			config = config || {};
			ChunkStreamer.call(this, config);

			var string;
			var remaining;
			this.stream = function(s)
			{
				string = s;
				remaining = s;
				return this._nextChunk();
			}
			this._nextChunk = function()
			{
				if (this._finished) return;
				var size = this._config.chunkSize;
				var chunk = size ? remaining.substr(0, size) : remaining;
				remaining = size ? remaining.substr(size) : '';
				this._finished = !remaining;
				return this.parseChunk(chunk);
			}
		}
		StringStreamer.prototype = Object.create(StringStreamer.prototype);
		StringStreamer.prototype.constructor = StringStreamer;



		// Use one ParserHandle per entire CSV file or string
		function ParserHandle(_config)
		{
			// One goal is to minimize the use of regular expressions...
			var FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;

			var self = this;
			var _stepCounter = 0;	// Number of times step was called (number of rows parsed)
			var _input;				// The input being parsed
			var _parser;			// The core parser being used
			var _paused = false;	// Whether we are paused or not
			var _aborted = false;   // Whether the parser has aborted or not
			var _delimiterError;	// Temporary state between delimiter detection and processing results
			var _fields = [];		// Fields are from the header row of the input, if there is one
			var _results = {		// The last results returned from the parser
				data: [],
				errors: [],
				meta: {}
			};

			if (isFunction(_config.step))
			{
				var userStep = _config.step;
				_config.step = function(results)
				{
					_results = results;

					if (needsHeaderRow())
						processResults();
					else	// only call user's step function after header row
					{
						processResults();

						// It's possbile that this line was empty and there's no row here after all
						if (_results.data.length == 0)
							return;

						_stepCounter += results.data.length;
						if (_config.preview && _stepCounter > _config.preview)
							_parser.abort();
						else
							userStep(_results, self);
					}
				};
			}

			/**
			 * Parses input. Most users won't need, and shouldn't mess with, the baseIndex
			 * and ignoreLastRow parameters. They are used by streamers (wrapper functions)
			 * when an input comes in multiple chunks, like from a file.
			 */
			this.parse = function(input, baseIndex, ignoreLastRow)
			{
				if (!_config.newline)
					_config.newline = guessLineEndings(input);

				_delimiterError = false;
				if (!_config.delimiter)
				{
					var delimGuess = guessDelimiter(input);
					if (delimGuess.successful)
						_config.delimiter = delimGuess.bestDelimiter;
					else
					{
						_delimiterError = true;	// add error after parsing (otherwise it would be overwritten)
						_config.delimiter = Papa.DefaultDelimiter;
					}
					_results.meta.delimiter = _config.delimiter;
				}

				var parserConfig = copy(_config);
				if (_config.preview && _config.header)
					parserConfig.preview++;	// to compensate for header row

				_input = input;
				_parser = new Parser(parserConfig);
				_results = _parser.parse(_input, baseIndex, ignoreLastRow);
				processResults();
				return _paused ? { meta: { paused: true } } : (_results || { meta: { paused: false } });
			};

			this.paused = function()
			{
				return _paused;
			};

			this.pause = function()
			{
				_paused = true;
				_parser.abort();
				_input = _input.substr(_parser.getCharIndex());
			};

			this.resume = function()
			{
				_paused = false;
				self.streamer.parseChunk(_input);
			};

			this.aborted = function () {
				return _aborted;
			}

			this.abort = function()
			{
				_aborted = true;
				_parser.abort();
				_results.meta.aborted = true;
				if (isFunction(_config.complete))
					_config.complete(_results);
				_input = "";
			};

			function processResults()
			{
				if (_results && _delimiterError)
				{
					addError("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '"+Papa.DefaultDelimiter+"'");
					_delimiterError = false;
				}

				if (_config.skipEmptyLines)
				{
					for (var i = 0; i < _results.data.length; i++)
						if (_results.data[i].length == 1 && _results.data[i][0] == "")
							_results.data.splice(i--, 1);
				}

				if (needsHeaderRow())
					fillHeaderFields();

				return applyHeaderAndDynamicTyping();
			}

			function needsHeaderRow()
			{
				return _config.header && _fields.length == 0;
			}

			function fillHeaderFields()
			{
				if (!_results)
					return;
				for (var i = 0; needsHeaderRow() && i < _results.data.length; i++)
					for (var j = 0; j < _results.data[i].length; j++)
						_fields.push(_results.data[i][j]);
				_results.data.splice(0, 1);
			}

			function applyHeaderAndDynamicTyping()
			{
				if (!_results || (!_config.header && !_config.dynamicTyping))
					return _results;

				for (var i = 0; i < _results.data.length; i++)
				{
					var row = {};

					for (var j = 0; j < _results.data[i].length; j++)
					{
						if (_config.dynamicTyping)
						{
							var value = _results.data[i][j];
							if (value == "true" || value == "TRUE")
								_results.data[i][j] = true;
							else if (value == "false" || value == "FALSE")
								_results.data[i][j] = false;
							else
								_results.data[i][j] = tryParseFloat(value);
						}

						if (_config.header)
						{
							if (j >= _fields.length)
							{
								if (!row["__parsed_extra"])
									row["__parsed_extra"] = [];
								row["__parsed_extra"].push(_results.data[i][j]);
							}
							else
								row[_fields[j]] = _results.data[i][j];
						}
					}

					if (_config.header)
					{
						_results.data[i] = row;
						if (j > _fields.length)
							addError("FieldMismatch", "TooManyFields", "Too many fields: expected " + _fields.length + " fields but parsed " + j, i);
						else if (j < _fields.length)
							addError("FieldMismatch", "TooFewFields", "Too few fields: expected " + _fields.length + " fields but parsed " + j, i);
					}
				}

				if (_config.header && _results.meta)
					_results.meta.fields = _fields;
				return _results;
			}

			function guessDelimiter(input)
			{
				var delimChoices = [",", "\t", "|", ";", Papa.RECORD_SEP, Papa.UNIT_SEP];
				var bestDelim, bestDelta, fieldCountPrevRow;

				for (var i = 0; i < delimChoices.length; i++)
				{
					var delim = delimChoices[i];
					var delta = 0, avgFieldCount = 0;
					fieldCountPrevRow = undefined;

					var preview = new Parser({
						delimiter: delim,
						preview: 10
					}).parse(input);

					for (var j = 0; j < preview.data.length; j++)
					{
						var fieldCount = preview.data[j].length;
						avgFieldCount += fieldCount;

						if (typeof fieldCountPrevRow === 'undefined')
						{
							fieldCountPrevRow = fieldCount;
							continue;
						}
						else if (fieldCount > 1)
						{
							delta += Math.abs(fieldCount - fieldCountPrevRow);
							fieldCountPrevRow = fieldCount;
						}
					}

					if (preview.data.length > 0)
						avgFieldCount /= preview.data.length;

					if ((typeof bestDelta === 'undefined' || delta < bestDelta)
						&& avgFieldCount > 1.99)
					{
						bestDelta = delta;
						bestDelim = delim;
					}
				}

				_config.delimiter = bestDelim;

				return {
					successful: !!bestDelim,
					bestDelimiter: bestDelim
				}
			}

			function guessLineEndings(input)
			{
				input = input.substr(0, 1024*1024);	// max length 1 MB

				var r = input.split('\r');

				if (r.length == 1)
					return '\n';

				var numWithN = 0;
				for (var i = 0; i < r.length; i++)
				{
					if (r[i][0] == '\n')
						numWithN++;
				}

				return numWithN >= r.length / 2 ? '\r\n' : '\r';
			}

			function tryParseFloat(val)
			{
				var isNumber = FLOAT.test(val);
				return isNumber ? parseFloat(val) : val;
			}

			function addError(type, code, msg, row)
			{
				_results.errors.push({
					type: type,
					code: code,
					message: msg,
					row: row
				});
			}
		}





		/** The core parser implements speedy and correct CSV parsing */
		function Parser(config)
		{
			// Unpack the config object
			config = config || {};
			var delim = config.delimiter;
			var newline = config.newline;
			var comments = config.comments;
			var step = config.step;
			var preview = config.preview;
			var fastMode = config.fastMode;

			// Delimiter must be valid
			if (typeof delim !== 'string'
				|| Papa.BAD_DELIMITERS.indexOf(delim) > -1)
				delim = ",";

			// Comment character must be valid
			if (comments === delim)
				throw "Comment character same as delimiter";
			else if (comments === true)
				comments = "#";
			else if (typeof comments !== 'string'
				|| Papa.BAD_DELIMITERS.indexOf(comments) > -1)
				comments = false;

			// Newline must be valid: \r, \n, or \r\n
			if (newline != '\n' && newline != '\r' && newline != '\r\n')
				newline = '\n';

			// We're gonna need these at the Parser scope
			var cursor = 0;
			var aborted = false;

			this.parse = function(input, baseIndex, ignoreLastRow)
			{
				// For some reason, in Chrome, this speeds things up (!?)
				if (typeof input !== 'string')
					throw "Input must be a string";

				// We don't need to compute some of these every time parse() is called,
				// but having them in a more local scope seems to perform better
				var inputLen = input.length,
					delimLen = delim.length,
					newlineLen = newline.length,
					commentsLen = comments.length;
				var stepIsFunction = typeof step === 'function';

				// Establish starting state
				cursor = 0;
				var data = [], errors = [], row = [], lastCursor = 0;

				if (!input)
					return returnable();

				if (fastMode || (fastMode !== false && input.indexOf('"') === -1))
				{
					var rows = input.split(newline);
					for (var i = 0; i < rows.length; i++)
					{
						var row = rows[i];
						cursor += row.length;
						if (i !== rows.length - 1)
							cursor += newline.length;
						else if (ignoreLastRow)
							return returnable();
						if (comments && row.substr(0, commentsLen) == comments)
							continue;
						if (stepIsFunction)
						{
							data = [];
							pushRow(row.split(delim));
							doStep();
							if (aborted)
								return returnable();
						}
						else
							pushRow(row.split(delim));
						if (preview && i >= preview)
						{
							data = data.slice(0, preview);
							return returnable(true);
						}
					}
					return returnable();
				}

				var nextDelim = input.indexOf(delim, cursor);
				var nextNewline = input.indexOf(newline, cursor);

				// Parser loop
				for (;;)
				{
					// Field has opening quote
					if (input[cursor] == '"')
					{
						// Start our search for the closing quote where the cursor is
						var quoteSearch = cursor;

						// Skip the opening quote
						cursor++;

						for (;;)
						{
							// Find closing quote
							var quoteSearch = input.indexOf('"', quoteSearch+1);

							if (quoteSearch === -1)
							{
								if (!ignoreLastRow) {
									// No closing quote... what a pity
									errors.push({
										type: "Quotes",
										code: "MissingQuotes",
										message: "Quoted field unterminated",
										row: data.length,	// row has yet to be inserted
										index: cursor
									});
								}
								return finish();
							}

							if (quoteSearch === inputLen-1)
							{
								// Closing quote at EOF
								var value = input.substring(cursor, quoteSearch).replace(/""/g, '"');
								return finish(value);
							}

							// If this quote is escaped, it's part of the data; skip it
							if (input[quoteSearch+1] == '"')
							{
								quoteSearch++;
								continue;
							}

							if (input[quoteSearch+1] == delim)
							{
								// Closing quote followed by delimiter
								row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
								cursor = quoteSearch + 1 + delimLen;
								nextDelim = input.indexOf(delim, cursor);
								nextNewline = input.indexOf(newline, cursor);
								break;
							}

							if (input.substr(quoteSearch+1, newlineLen) === newline)
							{
								// Closing quote followed by newline
								row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
								saveRow(quoteSearch + 1 + newlineLen);
								nextDelim = input.indexOf(delim, cursor);	// because we may have skipped the nextDelim in the quoted field

								if (stepIsFunction)
								{
									doStep();
									if (aborted)
										return returnable();
								}
								
								if (preview && data.length >= preview)
									return returnable(true);

								break;
							}
						}

						continue;
					}

					// Comment found at start of new line
					if (comments && row.length === 0 && input.substr(cursor, commentsLen) === comments)
					{
						if (nextNewline == -1)	// Comment ends at EOF
							return returnable();
						cursor = nextNewline + newlineLen;
						nextNewline = input.indexOf(newline, cursor);
						nextDelim = input.indexOf(delim, cursor);
						continue;
					}

					// Next delimiter comes before next newline, so we've reached end of field
					if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1))
					{
						row.push(input.substring(cursor, nextDelim));
						cursor = nextDelim + delimLen;
						nextDelim = input.indexOf(delim, cursor);
						continue;
					}

					// End of row
					if (nextNewline !== -1)
					{
						row.push(input.substring(cursor, nextNewline));
						saveRow(nextNewline + newlineLen);

						if (stepIsFunction)
						{
							doStep();
							if (aborted)
								return returnable();
						}

						if (preview && data.length >= preview)
							return returnable(true);

						continue;
					}

					break;
				}


				return finish();


				function pushRow(row)
				{
					data.push(row);
					lastCursor = cursor;
				}

				/**
				 * Appends the remaining input from cursor to the end into
				 * row, saves the row, calls step, and returns the results.
				 */
				function finish(value)
				{
					if (ignoreLastRow)
						return returnable();
					if (typeof value === 'undefined')
						value = input.substr(cursor);
					row.push(value);
					cursor = inputLen;	// important in case parsing is paused
					pushRow(row);
					if (stepIsFunction)
						doStep();
					return returnable();
				}

				/**
				 * Appends the current row to the results. It sets the cursor
				 * to newCursor and finds the nextNewline. The caller should
				 * take care to execute user's step function and check for
				 * preview and end parsing if necessary.
				 */
				function saveRow(newCursor)
				{
					cursor = newCursor;
					pushRow(row);
					row = [];
					nextNewline = input.indexOf(newline, cursor);
				}

				/** Returns an object with the results, errors, and meta. */
				function returnable(stopped)
				{
					return {
						data: data,
						errors: errors,
						meta: {
							delimiter: delim,
							linebreak: newline,
							aborted: aborted,
							truncated: !!stopped,
							cursor: lastCursor + (baseIndex || 0)
						}
					};
				}

				/** Executes the user's step function and resets data & errors. */
				function doStep()
				{
					step(returnable());
					data = [], errors = [];
				}
			};

			/** Sets the abort flag */
			this.abort = function()
			{
				aborted = true;
			};

			/** Gets the cursor position */
			this.getCharIndex = function()
			{
				return cursor;
			};
		}


		// If you need to load Papa Parse asynchronously and you also need worker threads, hard-code
		// the script path here. See: https://github.com/mholt/PapaParse/issues/87#issuecomment-57885358
		function getScriptPath()
		{
			var scripts = document.getElementsByTagName('script');
			return scripts.length ? scripts[scripts.length - 1].src : '';
		}

		function newWorker()
		{
			if (!Papa.WORKERS_SUPPORTED)
				return false;
			if (!LOADED_SYNC && Papa.SCRIPT_PATH === null)
				throw new Error(
					'Script path cannot be determined automatically when Papa Parse is loaded asynchronously. ' +
					'You need to set Papa.SCRIPT_PATH manually.'
				);
			var workerUrl = Papa.SCRIPT_PATH || AUTO_SCRIPT_PATH;
			// Append "papaworker" to the search string to tell papaparse that this is our worker.
			workerUrl += (workerUrl.indexOf('?') !== -1 ? '&' : '?') + 'papaworker';
			var w = new global.Worker(workerUrl);
			w.onmessage = mainThreadReceivedMessage;
			w.id = workerIdCounter++;
			workers[w.id] = w;
			return w;
		}

		/** Callback when main thread receives a message */
		function mainThreadReceivedMessage(e)
		{
			var msg = e.data;
			var worker = workers[msg.workerId];
			var aborted = false;

			if (msg.error)
				worker.userError(msg.error, msg.file);
			else if (msg.results && msg.results.data)
			{
				var abort = function() {
					aborted = true;
					completeWorker(msg.workerId, { data: [], errors: [], meta: { aborted: true } });
				};

				var handle = {
					abort: abort,
					pause: notImplemented,
					resume: notImplemented
				};

				if (isFunction(worker.userStep))
				{
					for (var i = 0; i < msg.results.data.length; i++)
					{
						worker.userStep({
							data: [msg.results.data[i]],
							errors: msg.results.errors,
							meta: msg.results.meta
						}, handle);
						if (aborted)
							break;
					}
					delete msg.results;	// free memory ASAP
				}
				else if (isFunction(worker.userChunk))
				{
					worker.userChunk(msg.results, handle, msg.file);
					delete msg.results;
				}
			}

			if (msg.finished && !aborted)
				completeWorker(msg.workerId, msg.results);
		}

		function completeWorker(workerId, results) {
			var worker = workers[workerId];
			if (isFunction(worker.userComplete))
				worker.userComplete(results);
			worker.terminate();
			delete workers[workerId];
		}

		function notImplemented() {
			throw "Not implemented.";
		}

		/** Callback when worker thread receives a message */
		function workerThreadReceivedMessage(e)
		{
			var msg = e.data;

			if (typeof Papa.WORKER_ID === 'undefined' && msg)
				Papa.WORKER_ID = msg.workerId;

			if (typeof msg.input === 'string')
			{
				global.postMessage({
					workerId: Papa.WORKER_ID,
					results: Papa.parse(msg.input, msg.config),
					finished: true
				});
			}
			else if ((global.File && msg.input instanceof File) || msg.input instanceof Object)	// thank you, Safari (see issue #106)
			{
				var results = Papa.parse(msg.input, msg.config);
				if (results)
					global.postMessage({
						workerId: Papa.WORKER_ID,
						results: results,
						finished: true
					});
			}
		}

		/** Makes a deep copy of an array or object (mostly) */
		function copy(obj)
		{
			if (typeof obj !== 'object')
				return obj;
			var cpy = obj instanceof Array ? [] : {};
			for (var key in obj)
				cpy[key] = copy(obj[key]);
			return cpy;
		}

		function bindFunction(f, self)
		{
			return function() { f.apply(self, arguments); };
		}

		function isFunction(func)
		{
			return typeof func === 'function';
		}
	})(typeof window !== 'undefined' ? window : this);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* FileSaver.js
	 * A saveAs() FileSaver implementation.
	 * 1.3.2
	 * 2016-06-16 18:25:19
	 *
	 * By Eli Grey, http://eligrey.com
	 * License: MIT
	 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
	 */

	/*global self */
	/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

	var saveAs = saveAs || (function(view) {
		"use strict";
		// IE <10 is explicitly unsupported
		if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
			return;
		}
		var
			  doc = view.document
			  // only get URL when necessary in case Blob.js hasn't overridden it yet
			, get_URL = function() {
				return view.URL || view.webkitURL || view;
			}
			, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
			, can_use_save_link = "download" in save_link
			, click = function(node) {
				var event = new MouseEvent("click");
				node.dispatchEvent(event);
			}
			, is_safari = /constructor/i.test(view.HTMLElement)
			, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
			, throw_outside = function(ex) {
				(view.setImmediate || view.setTimeout)(function() {
					throw ex;
				}, 0);
			}
			, force_saveable_type = "application/octet-stream"
			// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
			, arbitrary_revoke_timeout = 1000 * 40 // in ms
			, revoke = function(file) {
				var revoker = function() {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				};
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
			, dispatch = function(filesaver, event_types, event) {
				event_types = [].concat(event_types);
				var i = event_types.length;
				while (i--) {
					var listener = filesaver["on" + event_types[i]];
					if (typeof listener === "function") {
						try {
							listener.call(filesaver, event || filesaver);
						} catch (ex) {
							throw_outside(ex);
						}
					}
				}
			}
			, auto_bom = function(blob) {
				// prepend BOM for UTF-8 XML and text/* types (including HTML)
				// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
				if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
					return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
				}
				return blob;
			}
			, FileSaver = function(blob, name, no_auto_bom) {
				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				// First try a.download, then web filesystem, then object URLs
				var
					  filesaver = this
					, type = blob.type
					, force = type === force_saveable_type
					, object_url
					, dispatch_all = function() {
						dispatch(filesaver, "writestart progress write writeend".split(" "));
					}
					// on any filesys errors revert to saving with object URLs
					, fs_error = function() {
						if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
							// Safari doesn't allow downloading of blob urls
							var reader = new FileReader();
							reader.onloadend = function() {
								var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
								var popup = view.open(url, '_blank');
								if(!popup) view.location.href = url;
								url=undefined; // release reference before dispatching
								filesaver.readyState = filesaver.DONE;
								dispatch_all();
							};
							reader.readAsDataURL(blob);
							filesaver.readyState = filesaver.INIT;
							return;
						}
						// don't create more object URLs than needed
						if (!object_url) {
							object_url = get_URL().createObjectURL(blob);
						}
						if (force) {
							view.location.href = object_url;
						} else {
							var opened = view.open(object_url, "_blank");
							if (!opened) {
								// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
								view.location.href = object_url;
							}
						}
						filesaver.readyState = filesaver.DONE;
						dispatch_all();
						revoke(object_url);
					}
				;
				filesaver.readyState = filesaver.INIT;

				if (can_use_save_link) {
					object_url = get_URL().createObjectURL(blob);
					setTimeout(function() {
						save_link.href = object_url;
						save_link.download = name;
						click(save_link);
						dispatch_all();
						revoke(object_url);
						filesaver.readyState = filesaver.DONE;
					});
					return;
				}

				fs_error();
			}
			, FS_proto = FileSaver.prototype
			, saveAs = function(blob, name, no_auto_bom) {
				return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
			}
		;
		// IE 10+ (native saveAs)
		if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
			return function(blob, name, no_auto_bom) {
				name = name || blob.name || "download";

				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				return navigator.msSaveOrOpenBlob(blob, name);
			};
		}

		FS_proto.abort = function(){};
		FS_proto.readyState = FS_proto.INIT = 0;
		FS_proto.WRITING = 1;
		FS_proto.DONE = 2;

		FS_proto.error =
		FS_proto.onwritestart =
		FS_proto.onprogress =
		FS_proto.onwrite =
		FS_proto.onabort =
		FS_proto.onerror =
		FS_proto.onwriteend =
			null;

		return saveAs;
	}(
		   typeof self !== "undefined" && self
		|| typeof window !== "undefined" && window
		|| this.content
	));
	// `self` is undefined in Firefox for Android content script context
	// while `this` is nsIContentFrameMessageManager
	// with an attribute `content` that corresponds to the window

	if (typeof module !== "undefined" && module.exports) {
	  module.exports.saveAs = saveAs;
	} else if (("function" !== "undefined" && __webpack_require__(3) !== null) && (__webpack_require__(4) !== null)) {
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	    return saveAs;
	  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 4 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	* Underscore.string
	* (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
	* Underscore.string is freely distributable under the terms of the MIT license.
	* Documentation: https://github.com/epeli/underscore.string
	* Some code is borrowed from MooTools and Alexandru Marasteanu.
	* Version '3.3.4'
	* @preserve
	*/

	'use strict';

	function s(value) {
	  /* jshint validthis: true */
	  if (!(this instanceof s)) return new s(value);
	  this._wrapped = value;
	}

	s.VERSION = '3.3.4';

	s.isBlank          = __webpack_require__(6);
	s.stripTags        = __webpack_require__(8);
	s.capitalize       = __webpack_require__(9);
	s.decapitalize     = __webpack_require__(10);
	s.chop             = __webpack_require__(11);
	s.trim             = __webpack_require__(12);
	s.clean            = __webpack_require__(15);
	s.cleanDiacritics  = __webpack_require__(16);
	s.count            = __webpack_require__(17);
	s.chars            = __webpack_require__(18);
	s.swapCase         = __webpack_require__(19);
	s.escapeHTML       = __webpack_require__(20);
	s.unescapeHTML     = __webpack_require__(22);
	s.splice           = __webpack_require__(24);
	s.insert           = __webpack_require__(25);
	s.replaceAll       = __webpack_require__(26);
	s.include          = __webpack_require__(27);
	s.join             = __webpack_require__(28);
	s.lines            = __webpack_require__(29);
	s.dedent           = __webpack_require__(30);
	s.reverse          = __webpack_require__(31);
	s.startsWith       = __webpack_require__(32);
	s.endsWith         = __webpack_require__(34);
	s.pred             = __webpack_require__(35);
	s.succ             = __webpack_require__(37);
	s.titleize         = __webpack_require__(38);
	s.camelize         = __webpack_require__(39);
	s.underscored      = __webpack_require__(40);
	s.dasherize        = __webpack_require__(41);
	s.classify         = __webpack_require__(42);
	s.humanize         = __webpack_require__(43);
	s.ltrim            = __webpack_require__(44);
	s.rtrim            = __webpack_require__(45);
	s.truncate         = __webpack_require__(46);
	s.prune            = __webpack_require__(47);
	s.words            = __webpack_require__(48);
	s.pad              = __webpack_require__(49);
	s.lpad             = __webpack_require__(51);
	s.rpad             = __webpack_require__(52);
	s.lrpad            = __webpack_require__(53);
	s.sprintf          = __webpack_require__(54);
	s.vsprintf         = __webpack_require__(57);
	s.toNumber         = __webpack_require__(58);
	s.numberFormat     = __webpack_require__(59);
	s.strRight         = __webpack_require__(60);
	s.strRightBack     = __webpack_require__(61);
	s.strLeft          = __webpack_require__(62);
	s.strLeftBack      = __webpack_require__(63);
	s.toSentence       = __webpack_require__(64);
	s.toSentenceSerial = __webpack_require__(65);
	s.slugify          = __webpack_require__(66);
	s.surround         = __webpack_require__(67);
	s.quote            = __webpack_require__(68);
	s.unquote          = __webpack_require__(69);
	s.repeat           = __webpack_require__(70);
	s.naturalCmp       = __webpack_require__(71);
	s.levenshtein      = __webpack_require__(72);
	s.toBoolean        = __webpack_require__(73);
	s.exports          = __webpack_require__(74);
	s.escapeRegExp     = __webpack_require__(14);
	s.wrap             = __webpack_require__(75);
	s.map              = __webpack_require__(76);

	// Aliases
	s.strip     = s.trim;
	s.lstrip    = s.ltrim;
	s.rstrip    = s.rtrim;
	s.center    = s.lrpad;
	s.rjust     = s.lpad;
	s.ljust     = s.rpad;
	s.contains  = s.include;
	s.q         = s.quote;
	s.toBool    = s.toBoolean;
	s.camelcase = s.camelize;
	s.mapChars  = s.map;


	// Implement chaining
	s.prototype = {
	  value: function value() {
	    return this._wrapped;
	  }
	};

	function fn2method(key, fn) {
	  if (typeof fn !== 'function') return;
	  s.prototype[key] = function() {
	    var args = [this._wrapped].concat(Array.prototype.slice.call(arguments));
	    var res = fn.apply(null, args);
	    // if the result is non-string stop the chain and return the value
	    return typeof res === 'string' ? new s(res) : res;
	  };
	}

	// Copy functions to instance methods for chaining
	for (var key in s) fn2method(key, s[key]);

	fn2method('tap', function tap(string, fn) {
	  return fn(string);
	});

	function prototype2method(methodName) {
	  fn2method(methodName, function(context) {
	    var args = Array.prototype.slice.call(arguments, 1);
	    return String.prototype[methodName].apply(context, args);
	  });
	}

	var prototypeMethods = [
	  'toUpperCase',
	  'toLowerCase',
	  'split',
	  'replace',
	  'slice',
	  'substring',
	  'substr',
	  'concat'
	];

	for (var method in prototypeMethods) prototype2method(prototypeMethods[method]);


	module.exports = s;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function isBlank(str) {
	  return (/^\s*$/).test(makeString(str));
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Ensure some object is a coerced to a string
	 **/
	module.exports = function makeString(object) {
	  if (object == null) return '';
	  return '' + object;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function stripTags(str) {
	  return makeString(str).replace(/<\/?[^>]+>/g, '');
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function capitalize(str, lowercaseRest) {
	  str = makeString(str);
	  var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

	  return str.charAt(0).toUpperCase() + remainingChars;
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function decapitalize(str) {
	  str = makeString(str);
	  return str.charAt(0).toLowerCase() + str.slice(1);
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function chop(str, step) {
	  if (str == null) return [];
	  str = String(str);
	  step = ~~step;
	  return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var defaultToWhiteSpace = __webpack_require__(13);
	var nativeTrim = String.prototype.trim;

	module.exports = function trim(str, characters) {
	  str = makeString(str);
	  if (!characters && nativeTrim) return nativeTrim.call(str);
	  characters = defaultToWhiteSpace(characters);
	  return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var escapeRegExp = __webpack_require__(14);

	module.exports = function defaultToWhiteSpace(characters) {
	  if (characters == null)
	    return '\\s';
	  else if (characters.source)
	    return characters.source;
	  else
	    return '[' + escapeRegExp(characters) + ']';
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function escapeRegExp(str) {
	  return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(12);

	module.exports = function clean(str) {
	  return trim(str).replace(/\s\s+/g, ' ');
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	var makeString = __webpack_require__(7);

	var from  = 'ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźž',
	  to    = 'aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzz';

	from += from.toUpperCase();
	to += to.toUpperCase();

	to = to.split('');

	// for tokens requireing multitoken output
	from += 'ß';
	to.push('ss');


	module.exports = function cleanDiacritics(str) {
	  return makeString(str).replace(/.{1}/g, function(c){
	    var index = from.indexOf(c);
	    return index === -1 ? c : to[index];
	  });
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function(str, substr) {
	  str = makeString(str);
	  substr = makeString(substr);

	  if (str.length === 0 || substr.length === 0) return 0;
	  
	  return str.split(substr).length - 1;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function chars(str) {
	  return makeString(str).split('');
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function swapCase(str) {
	  return makeString(str).replace(/\S/g, function(c) {
	    return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
	  });
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var escapeChars = __webpack_require__(21);

	var regexString = '[';
	for(var key in escapeChars) {
	  regexString += key;
	}
	regexString += ']';

	var regex = new RegExp( regexString, 'g');

	module.exports = function escapeHTML(str) {

	  return makeString(str).replace(regex, function(m) {
	    return '&' + escapeChars[m] + ';';
	  });
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	/* We're explicitly defining the list of entities we want to escape.
	nbsp is an HTML entity, but we don't want to escape all space characters in a string, hence its omission in this map.

	*/
	var escapeChars = {
	  '¢' : 'cent',
	  '£' : 'pound',
	  '¥' : 'yen',
	  '€': 'euro',
	  '©' :'copy',
	  '®' : 'reg',
	  '<' : 'lt',
	  '>' : 'gt',
	  '"' : 'quot',
	  '&' : 'amp',
	  '\'' : '#39'
	};

	module.exports = escapeChars;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var htmlEntities = __webpack_require__(23);

	module.exports = function unescapeHTML(str) {
	  return makeString(str).replace(/\&([^;]+);/g, function(entity, entityCode) {
	    var match;

	    if (entityCode in htmlEntities) {
	      return htmlEntities[entityCode];
	    /*eslint no-cond-assign: 0*/
	    } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
	      return String.fromCharCode(parseInt(match[1], 16));
	    /*eslint no-cond-assign: 0*/
	    } else if (match = entityCode.match(/^#(\d+)$/)) {
	      return String.fromCharCode(~~match[1]);
	    } else {
	      return entity;
	    }
	  });
	};


/***/ },
/* 23 */
/***/ function(module, exports) {

	/*
	We're explicitly defining the list of entities that might see in escape HTML strings
	*/
	var htmlEntities = {
	  nbsp: ' ',
	  cent: '¢',
	  pound: '£',
	  yen: '¥',
	  euro: '€',
	  copy: '©',
	  reg: '®',
	  lt: '<',
	  gt: '>',
	  quot: '"',
	  amp: '&',
	  apos: '\''
	};

	module.exports = htmlEntities;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var chars = __webpack_require__(18);

	module.exports = function splice(str, i, howmany, substr) {
	  var arr = chars(str);
	  arr.splice(~~i, ~~howmany, substr);
	  return arr.join('');
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var splice = __webpack_require__(24);

	module.exports = function insert(str, i, substr) {
	  return splice(str, i, 0, substr);
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function replaceAll(str, find, replace, ignorecase) {
	  var flags = (ignorecase === true)?'gi':'g';
	  var reg = new RegExp(find, flags);

	  return makeString(str).replace(reg, replace);
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function include(str, needle) {
	  if (needle === '') return true;
	  return makeString(str).indexOf(needle) !== -1;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var slice = [].slice;

	module.exports = function join() {
	  var args = slice.call(arguments),
	    separator = args.shift();

	  return args.join(makeString(separator));
	};


/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = function lines(str) {
	  if (str == null) return [];
	  return String(str).split(/\r\n?|\n/);
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	function getIndent(str) {
	  var matches = str.match(/^[\s\\t]*/gm);
	  var indent = matches[0].length;
	  
	  for (var i = 1; i < matches.length; i++) {
	    indent = Math.min(matches[i].length, indent);
	  }

	  return indent;
	}

	module.exports = function dedent(str, pattern) {
	  str = makeString(str);
	  var indent = getIndent(str);
	  var reg;

	  if (indent === 0) return str;

	  if (typeof pattern === 'string') {
	    reg = new RegExp('^' + pattern, 'gm');
	  } else {
	    reg = new RegExp('^[ \\t]{' + indent + '}', 'gm');
	  }

	  return str.replace(reg, '');
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var chars = __webpack_require__(18);

	module.exports = function reverse(str) {
	  return chars(str).reverse().join('');
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var toPositive = __webpack_require__(33);

	module.exports = function startsWith(str, starts, position) {
	  str = makeString(str);
	  starts = '' + starts;
	  position = position == null ? 0 : Math.min(toPositive(position), str.length);
	  return str.lastIndexOf(starts, position) === position;
	};


/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function toPositive(number) {
	  return number < 0 ? 0 : (+number || 0);
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var toPositive = __webpack_require__(33);

	module.exports = function endsWith(str, ends, position) {
	  str = makeString(str);
	  ends = '' + ends;
	  if (typeof position == 'undefined') {
	    position = str.length - ends.length;
	  } else {
	    position = Math.min(toPositive(position), str.length) - ends.length;
	  }
	  return position >= 0 && str.indexOf(ends, position) === position;
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var adjacent = __webpack_require__(36);

	module.exports = function succ(str) {
	  return adjacent(str, -1);
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function adjacent(str, direction) {
	  str = makeString(str);
	  if (str.length === 0) {
	    return '';
	  }
	  return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + direction);
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var adjacent = __webpack_require__(36);

	module.exports = function succ(str) {
	  return adjacent(str, 1);
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function titleize(str) {
	  return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
	    return c.toUpperCase();
	  });
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(12);
	var decap = __webpack_require__(10);

	module.exports = function camelize(str, decapitalize) {
	  str = trim(str).replace(/[-_\s]+(.)?/g, function(match, c) {
	    return c ? c.toUpperCase() : '';
	  });

	  if (decapitalize === true) {
	    return decap(str);
	  } else {
	    return str;
	  }
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(12);

	module.exports = function underscored(str) {
	  return trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(12);

	module.exports = function dasherize(str) {
	  return trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
	};


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var capitalize = __webpack_require__(9);
	var camelize = __webpack_require__(39);
	var makeString = __webpack_require__(7);

	module.exports = function classify(str) {
	  str = makeString(str);
	  return capitalize(camelize(str.replace(/[\W_]/g, ' ')).replace(/\s/g, ''));
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var capitalize = __webpack_require__(9);
	var underscored = __webpack_require__(40);
	var trim = __webpack_require__(12);

	module.exports = function humanize(str) {
	  return capitalize(trim(underscored(str).replace(/_id$/, '').replace(/_/g, ' ')));
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var defaultToWhiteSpace = __webpack_require__(13);
	var nativeTrimLeft = String.prototype.trimLeft;

	module.exports = function ltrim(str, characters) {
	  str = makeString(str);
	  if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);
	  characters = defaultToWhiteSpace(characters);
	  return str.replace(new RegExp('^' + characters + '+'), '');
	};


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var defaultToWhiteSpace = __webpack_require__(13);
	var nativeTrimRight = String.prototype.trimRight;

	module.exports = function rtrim(str, characters) {
	  str = makeString(str);
	  if (!characters && nativeTrimRight) return nativeTrimRight.call(str);
	  characters = defaultToWhiteSpace(characters);
	  return str.replace(new RegExp(characters + '+$'), '');
	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function truncate(str, length, truncateStr) {
	  str = makeString(str);
	  truncateStr = truncateStr || '...';
	  length = ~~length;
	  return str.length > length ? str.slice(0, length) + truncateStr : str;
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * _s.prune: a more elegant version of truncate
	 * prune extra chars, never leaving a half-chopped word.
	 * @author github.com/rwz
	 */
	var makeString = __webpack_require__(7);
	var rtrim = __webpack_require__(45);

	module.exports = function prune(str, length, pruneStr) {
	  str = makeString(str);
	  length = ~~length;
	  pruneStr = pruneStr != null ? String(pruneStr) : '...';

	  if (str.length <= length) return str;

	  var tmpl = function(c) {
	      return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ';
	    },
	    template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

	  if (template.slice(template.length - 2).match(/\w\w/))
	    template = template.replace(/\s*\S+$/, '');
	  else
	    template = rtrim(template.slice(0, template.length - 1));

	  return (template + pruneStr).length > str.length ? str : str.slice(0, template.length) + pruneStr;
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var isBlank = __webpack_require__(6);
	var trim = __webpack_require__(12);

	module.exports = function words(str, delimiter) {
	  if (isBlank(str)) return [];
	  return trim(str, delimiter).split(delimiter || /\s+/);
	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var strRepeat = __webpack_require__(50);

	module.exports = function pad(str, length, padStr, type) {
	  str = makeString(str);
	  length = ~~length;

	  var padlen = 0;

	  if (!padStr)
	    padStr = ' ';
	  else if (padStr.length > 1)
	    padStr = padStr.charAt(0);

	  switch (type) {
	  case 'right':
	    padlen = length - str.length;
	    return str + strRepeat(padStr, padlen);
	  case 'both':
	    padlen = length - str.length;
	    return strRepeat(padStr, Math.ceil(padlen / 2)) + str + strRepeat(padStr, Math.floor(padlen / 2));
	  default: // 'left'
	    padlen = length - str.length;
	    return strRepeat(padStr, padlen) + str;
	  }
	};


/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = function strRepeat(str, qty){
	  if (qty < 1) return '';
	  var result = '';
	  while (qty > 0) {
	    if (qty & 1) result += str;
	    qty >>= 1, str += str;
	  }
	  return result;
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var pad = __webpack_require__(49);

	module.exports = function lpad(str, length, padStr) {
	  return pad(str, length, padStr);
	};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var pad = __webpack_require__(49);

	module.exports = function rpad(str, length, padStr) {
	  return pad(str, length, padStr, 'right');
	};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var pad = __webpack_require__(49);

	module.exports = function lrpad(str, length, padStr) {
	  return pad(str, length, padStr, 'both');
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var deprecate = __webpack_require__(55);

	module.exports = deprecate(__webpack_require__(56).sprintf,
	  'sprintf() will be removed in the next major release, use the sprintf-js package instead.');


/***/ },
/* 55 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module exports.
	 */

	module.exports = deprecate;

	/**
	 * Mark that a method should not be used.
	 * Returns a modified function which warns once by default.
	 *
	 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
	 *
	 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
	 * will throw an Error when invoked.
	 *
	 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
	 * will invoke `console.trace()` instead of `console.error()`.
	 *
	 * @param {Function} fn - the function to deprecate
	 * @param {String} msg - the string to print to the console when `fn` is invoked
	 * @returns {Function} a new "deprecated" version of `fn`
	 * @api public
	 */

	function deprecate (fn, msg) {
	  if (config('noDeprecation')) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (config('throwDeprecation')) {
	        throw new Error(msg);
	      } else if (config('traceDeprecation')) {
	        console.trace(msg);
	      } else {
	        console.warn(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	}

	/**
	 * Checks `localStorage` for boolean values for the given `name`.
	 *
	 * @param {String} name
	 * @returns {Boolean}
	 * @api private
	 */

	function config (name) {
	  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
	  try {
	    if (!global.localStorage) return false;
	  } catch (_) {
	    return false;
	  }
	  var val = global.localStorage[name];
	  if (null == val) return false;
	  return String(val).toLowerCase() === 'true';
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	(function(window) {
	    var re = {
	        not_string: /[^s]/,
	        number: /[diefg]/,
	        json: /[j]/,
	        not_json: /[^j]/,
	        text: /^[^\x25]+/,
	        modulo: /^\x25{2}/,
	        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
	        key: /^([a-z_][a-z_\d]*)/i,
	        key_access: /^\.([a-z_][a-z_\d]*)/i,
	        index_access: /^\[(\d+)\]/,
	        sign: /^[\+\-]/
	    }

	    function sprintf() {
	        var key = arguments[0], cache = sprintf.cache
	        if (!(cache[key] && cache.hasOwnProperty(key))) {
	            cache[key] = sprintf.parse(key)
	        }
	        return sprintf.format.call(null, cache[key], arguments)
	    }

	    sprintf.format = function(parse_tree, argv) {
	        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
	        for (i = 0; i < tree_length; i++) {
	            node_type = get_type(parse_tree[i])
	            if (node_type === "string") {
	                output[output.length] = parse_tree[i]
	            }
	            else if (node_type === "array") {
	                match = parse_tree[i] // convenience purposes only
	                if (match[2]) { // keyword argument
	                    arg = argv[cursor]
	                    for (k = 0; k < match[2].length; k++) {
	                        if (!arg.hasOwnProperty(match[2][k])) {
	                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
	                        }
	                        arg = arg[match[2][k]]
	                    }
	                }
	                else if (match[1]) { // positional argument (explicit)
	                    arg = argv[match[1]]
	                }
	                else { // positional argument (implicit)
	                    arg = argv[cursor++]
	                }

	                if (get_type(arg) == "function") {
	                    arg = arg()
	                }

	                if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
	                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
	                }

	                if (re.number.test(match[8])) {
	                    is_positive = arg >= 0
	                }

	                switch (match[8]) {
	                    case "b":
	                        arg = arg.toString(2)
	                    break
	                    case "c":
	                        arg = String.fromCharCode(arg)
	                    break
	                    case "d":
	                    case "i":
	                        arg = parseInt(arg, 10)
	                    break
	                    case "j":
	                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
	                    break
	                    case "e":
	                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
	                    break
	                    case "f":
	                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
	                    break
	                    case "g":
	                        arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
	                    break
	                    case "o":
	                        arg = arg.toString(8)
	                    break
	                    case "s":
	                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
	                    break
	                    case "u":
	                        arg = arg >>> 0
	                    break
	                    case "x":
	                        arg = arg.toString(16)
	                    break
	                    case "X":
	                        arg = arg.toString(16).toUpperCase()
	                    break
	                }
	                if (re.json.test(match[8])) {
	                    output[output.length] = arg
	                }
	                else {
	                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
	                        sign = is_positive ? "+" : "-"
	                        arg = arg.toString().replace(re.sign, "")
	                    }
	                    else {
	                        sign = ""
	                    }
	                    pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
	                    pad_length = match[6] - (sign + arg).length
	                    pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
	                    output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
	                }
	            }
	        }
	        return output.join("")
	    }

	    sprintf.cache = {}

	    sprintf.parse = function(fmt) {
	        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
	        while (_fmt) {
	            if ((match = re.text.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = match[0]
	            }
	            else if ((match = re.modulo.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = "%"
	            }
	            else if ((match = re.placeholder.exec(_fmt)) !== null) {
	                if (match[2]) {
	                    arg_names |= 1
	                    var field_list = [], replacement_field = match[2], field_match = []
	                    if ((field_match = re.key.exec(replacement_field)) !== null) {
	                        field_list[field_list.length] = field_match[1]
	                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
	                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else {
	                                throw new SyntaxError("[sprintf] failed to parse named argument key")
	                            }
	                        }
	                    }
	                    else {
	                        throw new SyntaxError("[sprintf] failed to parse named argument key")
	                    }
	                    match[2] = field_list
	                }
	                else {
	                    arg_names |= 2
	                }
	                if (arg_names === 3) {
	                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
	                }
	                parse_tree[parse_tree.length] = match
	            }
	            else {
	                throw new SyntaxError("[sprintf] unexpected placeholder")
	            }
	            _fmt = _fmt.substring(match[0].length)
	        }
	        return parse_tree
	    }

	    var vsprintf = function(fmt, argv, _argv) {
	        _argv = (argv || []).slice(0)
	        _argv.splice(0, 0, fmt)
	        return sprintf.apply(null, _argv)
	    }

	    /**
	     * helpers
	     */
	    function get_type(variable) {
	        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
	    }

	    function str_repeat(input, multiplier) {
	        return Array(multiplier + 1).join(input)
	    }

	    /**
	     * export to either browser or node.js
	     */
	    if (true) {
	        exports.sprintf = sprintf
	        exports.vsprintf = vsprintf
	    }
	    else {
	        window.sprintf = sprintf
	        window.vsprintf = vsprintf

	        if (typeof define === "function" && define.amd) {
	            define(function() {
	                return {
	                    sprintf: sprintf,
	                    vsprintf: vsprintf
	                }
	            })
	        }
	    }
	})(typeof window === "undefined" ? this : window);


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var deprecate = __webpack_require__(55);

	module.exports = deprecate(__webpack_require__(56).vsprintf,
	  'vsprintf() will be removed in the next major release, use the sprintf-js package instead.');


/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = function toNumber(num, precision) {
	  if (num == null) return 0;
	  var factor = Math.pow(10, isFinite(precision) ? precision : 0);
	  return Math.round(num * factor) / factor;
	};


/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = function numberFormat(number, dec, dsep, tsep) {
	  if (isNaN(number) || number == null) return '';

	  number = number.toFixed(~~dec);
	  tsep = typeof tsep == 'string' ? tsep : ',';

	  var parts = number.split('.'),
	    fnums = parts[0],
	    decimals = parts[1] ? (dsep || '.') + parts[1] : '';

	  return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function strRight(str, sep) {
	  str = makeString(str);
	  sep = makeString(sep);
	  var pos = !sep ? -1 : str.indexOf(sep);
	  return~ pos ? str.slice(pos + sep.length, str.length) : str;
	};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function strRightBack(str, sep) {
	  str = makeString(str);
	  sep = makeString(sep);
	  var pos = !sep ? -1 : str.lastIndexOf(sep);
	  return~ pos ? str.slice(pos + sep.length, str.length) : str;
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function strLeft(str, sep) {
	  str = makeString(str);
	  sep = makeString(sep);
	  var pos = !sep ? -1 : str.indexOf(sep);
	  return~ pos ? str.slice(0, pos) : str;
	};


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function strLeftBack(str, sep) {
	  str = makeString(str);
	  sep = makeString(sep);
	  var pos = str.lastIndexOf(sep);
	  return~ pos ? str.slice(0, pos) : str;
	};


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var rtrim = __webpack_require__(45);

	module.exports = function toSentence(array, separator, lastSeparator, serial) {
	  separator = separator || ', ';
	  lastSeparator = lastSeparator || ' and ';
	  var a = array.slice(),
	    lastMember = a.pop();

	  if (array.length > 2 && serial) lastSeparator = rtrim(separator) + lastSeparator;

	  return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var toSentence = __webpack_require__(64);

	module.exports = function toSentenceSerial(array, sep, lastSep) {
	  return toSentence(array, sep, lastSep, true);
	};


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(12);
	var dasherize = __webpack_require__(41);
	var cleanDiacritics = __webpack_require__(16);

	module.exports = function slugify(str) {
	  return trim(dasherize(cleanDiacritics(str).replace(/[^\w\s-]/g, '-').toLowerCase()), '-');
	};


/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = function surround(str, wrapper) {
	  return [wrapper, str, wrapper].join('');
	};


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var surround = __webpack_require__(67);

	module.exports = function quote(str, quoteChar) {
	  return surround(str, quoteChar || '"');
	};


/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = function unquote(str, quoteChar) {
	  quoteChar = quoteChar || '"';
	  if (str[0] === quoteChar && str[str.length - 1] === quoteChar)
	    return str.slice(1, str.length - 1);
	  else return str;
	};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);
	var strRepeat = __webpack_require__(50);

	module.exports = function repeat(str, qty, separator) {
	  str = makeString(str);

	  qty = ~~qty;

	  // using faster implementation if separator is not needed;
	  if (separator == null) return strRepeat(str, qty);

	  // this one is about 300x slower in Google Chrome
	  /*eslint no-empty: 0*/
	  for (var repeat = []; qty > 0; repeat[--qty] = str) {}
	  return repeat.join(separator);
	};


/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = function naturalCmp(str1, str2) {
	  if (str1 == str2) return 0;
	  if (!str1) return -1;
	  if (!str2) return 1;

	  var cmpRegex = /(\.\d+|\d+|\D+)/g,
	    tokens1 = String(str1).match(cmpRegex),
	    tokens2 = String(str2).match(cmpRegex),
	    count = Math.min(tokens1.length, tokens2.length);

	  for (var i = 0; i < count; i++) {
	    var a = tokens1[i],
	      b = tokens2[i];

	    if (a !== b) {
	      var num1 = +a;
	      var num2 = +b;
	      if (num1 === num1 && num2 === num2) {
	        return num1 > num2 ? 1 : -1;
	      }
	      return a < b ? -1 : 1;
	    }
	  }

	  if (tokens1.length != tokens2.length)
	    return tokens1.length - tokens2.length;

	  return str1 < str2 ? -1 : 1;
	};


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	/**
	 * Based on the implementation here: https://github.com/hiddentao/fast-levenshtein
	 */
	module.exports = function levenshtein(str1, str2) {
	  'use strict';
	  str1 = makeString(str1);
	  str2 = makeString(str2);

	  // Short cut cases  
	  if (str1 === str2) return 0;
	  if (!str1 || !str2) return Math.max(str1.length, str2.length);

	  // two rows
	  var prevRow = new Array(str2.length + 1);

	  // initialise previous row
	  for (var i = 0; i < prevRow.length; ++i) {
	    prevRow[i] = i;
	  }

	  // calculate current row distance from previous row
	  for (i = 0; i < str1.length; ++i) {
	    var nextCol = i + 1;

	    for (var j = 0; j < str2.length; ++j) {
	      var curCol = nextCol;

	      // substution
	      nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
	      // insertion
	      var tmp = curCol + 1;
	      if (nextCol > tmp) {
	        nextCol = tmp;
	      }
	      // deletion
	      tmp = prevRow[j + 1] + 1;
	      if (nextCol > tmp) {
	        nextCol = tmp;
	      }

	      // copy current col value into previous (in preparation for next iteration)
	      prevRow[j] = curCol;
	    }

	    // copy last col value into previous (in preparation for next iteration)
	    prevRow[j] = nextCol;
	  }

	  return nextCol;
	};


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var trim = __webpack_require__(12);

	function boolMatch(s, matchers) {
	  var i, matcher, down = s.toLowerCase();
	  matchers = [].concat(matchers);
	  for (i = 0; i < matchers.length; i += 1) {
	    matcher = matchers[i];
	    if (!matcher) continue;
	    if (matcher.test && matcher.test(s)) return true;
	    if (matcher.toLowerCase() === down) return true;
	  }
	}

	module.exports = function toBoolean(str, trueValues, falseValues) {
	  if (typeof str === 'number') str = '' + str;
	  if (typeof str !== 'string') return !!str;
	  str = trim(str);
	  if (boolMatch(str, trueValues || ['true', '1'])) return true;
	  if (boolMatch(str, falseValues || ['false', '0'])) return false;
	};


/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = function() {
	  var result = {};

	  for (var prop in this) {
	    if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse|join|map|wrap)$/)) continue;
	    result[prop] = this[prop];
	  }

	  return result;
	};


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// Wrap
	// wraps a string by a certain width

	var makeString = __webpack_require__(7);

	module.exports = function wrap(str, options){
	  str = makeString(str);
	  
	  options = options || {};
	  
	  var width = options.width || 75;
	  var seperator = options.seperator || '\n';
	  var cut = options.cut || false;
	  var preserveSpaces = options.preserveSpaces || false;
	  var trailingSpaces = options.trailingSpaces || false;
	  
	  var result;
	  
	  if(width <= 0){
	    return str;
	  }
	  
	  else if(!cut){
	  
	    var words = str.split(' ');
	    var current_column = 0;
	    result = '';
	  
	    while(words.length > 0){
	      
	      // if adding a space and the next word would cause this line to be longer than width...
	      if(1 + words[0].length + current_column > width){
	        //start a new line if this line is not already empty
	        if(current_column > 0){
	          // add a space at the end of the line is preserveSpaces is true
	          if (preserveSpaces){
	            result += ' ';
	            current_column++;
	          }
	          // fill the rest of the line with spaces if trailingSpaces option is true
	          else if(trailingSpaces){
	            while(current_column < width){
	              result += ' ';
	              current_column++;
	            }            
	          }
	          //start new line
	          result += seperator;
	          current_column = 0;
	        }
	      }
	  
	      // if not at the begining of the line, add a space in front of the word
	      if(current_column > 0){
	        result += ' ';
	        current_column++;
	      }
	  
	      // tack on the next word, update current column, a pop words array
	      result += words[0];
	      current_column += words[0].length;
	      words.shift();
	  
	    }
	  
	    // fill the rest of the line with spaces if trailingSpaces option is true
	    if(trailingSpaces){
	      while(current_column < width){
	        result += ' ';
	        current_column++;
	      }            
	    }
	  
	    return result;
	  
	  }
	  
	  else {
	  
	    var index = 0;
	    result = '';
	  
	    // walk through each character and add seperators where appropriate
	    while(index < str.length){
	      if(index % width == 0 && index > 0){
	        result += seperator;
	      }
	      result += str.charAt(index);
	      index++;
	    }
	  
	    // fill the rest of the line with spaces if trailingSpaces option is true
	    if(trailingSpaces){
	      while(index % width > 0){
	        result += ' ';
	        index++;
	      }            
	    }
	    
	    return result;
	  }
	};


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(7);

	module.exports = function(str, callback) {
	  str = makeString(str);

	  if (str.length === 0 || typeof callback !== 'function') return str;

	  return str.replace(/./g, callback);
	};


/***/ }
/******/ ]);