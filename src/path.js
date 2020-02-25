
(function() {

	var $path = {};

	///
	///
	///
	function spline_sqr(v) {
		return v * v;
	}

	///
	///
	///
	function nonloop_spline_precalculate(points) { // solo se llama si se modifican los nodos
		var spline_mag = 1.0 / Math.sqrt(2.0);
		//var spline_mag = 1.0;
		if (points.length > 2) {
			for (var ii = 0; ii < points.length; ++ii) {
				if (ii == 0) { // first segment
					var tomag = Math.sqrt(spline_sqr(points[ii + 2].x - points[ii].x) + spline_sqr(points[ii + 2].y - points[ii].y));
					var thismag = Math.sqrt(spline_sqr(points[ii + 1].x - points[ii].x) + spline_sqr(points[ii + 1].y - points[ii].y));
					points[ii].fromlinex1 = points[ii].x;
					points[ii].fromlinex2 = points[ii + 1].x;
					points[ii].tolinex1 = points[ii + 1].x - (points[ii + 2].x - points[ii].x) * thismag / tomag * spline_mag;
					points[ii].tolinex2 = points[ii + 1].x;
					points[ii].fromliney1 = points[ii].y;
					points[ii].fromliney2 = points[ii + 1].y;
					points[ii].toliney1 = points[ii + 1].y - (points[ii + 2].y - points[ii].y) * thismag / tomag * spline_mag;
					points[ii].toliney2 = points[ii + 1].y;
				} else if (ii == points.length - 2) { // last segment
					var frommag = Math.sqrt(spline_sqr(points[ii + 1].x - points[ii - 1].x) + spline_sqr(points[ii + 1].y - points[ii - 1].y));
					var thismag = Math.sqrt(spline_sqr(points[ii + 1].x - points[ii].x) + spline_sqr(points[ii + 1].y - points[ii].y));
					points[ii].fromlinex1 = points[ii].x;
					points[ii].fromlinex2 = points[ii].x + (points[ii + 1].x - points[ii - 1].x) * thismag / frommag * spline_mag;
					points[ii].tolinex1 = points[ii].x;
					points[ii].tolinex2 = points[ii + 1].x;
					points[ii].fromliney1 = points[ii].y;
					points[ii].fromliney2 = points[ii].y + (points[ii + 1].y - points[ii - 1].y) * thismag / frommag * spline_mag;
					points[ii].toliney1 = points[ii].y;
					points[ii].toliney2 = points[ii + 1].y;
				} else if (ii < points.length - 2) { // middle segment
					var frommag = Math.sqrt(spline_sqr(points[ii + 1].x - points[ii - 1].x) + spline_sqr(points[ii + 1].y - points[ii - 1].y));
					var tomag = Math.sqrt(spline_sqr(points[ii + 2].x - points[ii].x) + spline_sqr(points[ii + 2].y - points[ii].y));
					var thismag = Math.sqrt(spline_sqr(points[ii + 1].x - points[ii].x) + spline_sqr(points[ii + 1].y - points[ii].y));
					points[ii].fromlinex1 = points[ii].x;
					points[ii].fromlinex2 = points[ii].x + (points[ii + 1].x - points[ii - 1].x) * thismag / frommag * spline_mag;
					points[ii].tolinex1 = points[ii + 1].x - (points[ii + 2].x - points[ii].x) * thismag / tomag * spline_mag;
					points[ii].tolinex2 = points[ii + 1].x;
					points[ii].fromliney1 = points[ii].y;
					points[ii].fromliney2 = points[ii].y + (points[ii + 1].y - points[ii - 1].y) * thismag / frommag * spline_mag;
					points[ii].toliney1 = points[ii + 1].y - (points[ii + 2].y - points[ii].y) * thismag / tomag * spline_mag;
					points[ii].toliney2 = points[ii + 1].y;
				}
			}
		}
	}

	///
	///
	///
	function spline(points) {
		var this_spline = new Array();
		for (var ii = 0; ii < points.length; ++ii) {
			if (points[ii].cmd) {
				this_spline.push({x: points[ii].x, y: points[ii].y, cmd: points[ii].cmd});
			} else {
				this_spline.push({x: points[ii].x, y: points[ii].y});
			}
		}
		
		this_spline.getx = function(i) {
			var ii = Math.floor(i); // segment number
			var iif = i - ii; // segment position
			ii = ii % (this_spline.length - 1); // loop segment number
			if (this_spline.length == 1) {
				return this_spline[0].x;
			} else if (this_spline.length == 2) {
				if (ii == 0) {
					return this_spline[0].x + (this_spline[1].x - this_spline[0].x) * iif;
				} else { // if (ii == 1)
					return this_spline[0].x + (this_spline[1].x - this_spline[0].x) * (1.0 - iif);
				}
			} else {
				var iif1 = 1.0 - iif;
				var pif = spline_sqr(Math.sin(iif * Math.PI / 2.0));
				var pif1 = spline_sqr(Math.cos(iif * Math.PI / 2.0));
				return (this_spline[ii].fromlinex1 * iif1 + this_spline[ii].fromlinex2 * iif) * pif1 + (this_spline[ii].tolinex1 * iif1 + this_spline[ii].tolinex2 * iif) * pif;
			}
		}
		this_spline.gety = function(i) {
			var ii = Math.floor(i); // segment number
			var iif = i - ii; // segment position
			ii = ii % (this_spline.length - 1); // loop segment number
			if (this_spline.length == 1) {
				return this_spline[0].y;
			} else if (this_spline.length == 2) {
				if (ii == 0) {
					return this_spline[0].y + (this_spline[1].y - this_spline[0].y) * iif;
				} else { // if (ii == 1)
					return this_spline[0].y + (this_spline[1].y - this_spline[0].y) * (1.0 - iif);
				}
			} else {
				var iif1 = 1.0 - iif;
				var pif = spline_sqr(Math.sin(iif * Math.PI / 2.0));
				var pif1 = spline_sqr(Math.cos(iif * Math.PI / 2.0));
				return (this_spline[ii].fromliney1 * iif1 + this_spline[ii].fromliney2 * iif) * pif1 + (this_spline[ii].toliney1 * iif1 + this_spline[ii].toliney2 * iif) * pif;
			}
		}
		this_spline.getcmd = function(i) {
			if (this_spline.length) {
				var ii = Math.floor(i); // segment number
				ii = ii % (this_spline.length - 1); // loop segment number
				return this_spline[ii].cmd;
			} else {
				return undefined;
			}
		}
		this_spline.getcmd1 = function(i) {
			if (this_spline.length) {
				var ii = Math.floor(i); // segment number
				ii = ii % (this_spline.length - 1); // loop segment number
				return this_spline[ii + 1].cmd;
			} else {
				return undefined;
			}
		}
		this_spline.getlen = function() {
			return this_spline.length;
		}
		this_spline.recalculate = function() {
			nonloop_spline_precalculate(this_spline);
		}
		this_spline.describe = function() {
			var desc = ["spline(["];
			for (var i = 0; i < this_spline.length; ++i) {
				if (i > 0) desc.push(", ");
				desc.push("{x: ");
				desc.push((Math.round(this_spline[i].x * 100) / 100).toString());
				desc.push(", y: ");
				desc.push((Math.round(this_spline[i].y * 100) / 100).toString());
				if (this_spline[i].c) {
					desc.push(", cmd: ");
					desc.push(JSON.stringify(this_spline[i].cmd));
				}
				desc.push("}");
			}
			desc.push("]);");
			return desc.join("");
		}
		
		this_spline.recalculate();
		return this_spline;
	}
	$path.spline = spline;

	window.$path = $path;
})();



