
(function() {

	///
	///
	///
	function collisionhgrid(width, slices) {
		var thishgrid = new Array();
		thishgrid.idcount = 0;
		thishgrid.width = width;
		thishgrid.slices = slices;
		for (var i = 0; i < thishgrid.slices; ++i) {
			thishgrid[i] = {};
		}

		thishgrid.add = function(object) {
			var gridspriteid = "c" + (++thishgrid.idcount);
			var x = object && object.x;
			if ((x >= 0) && (x < thishgrid.width)) {
				var ii = Math.floor(x * thishgrid.slices / thishgrid.width);
				thishgrid[ii][gridspriteid] = object;
			}
			return gridspriteid;
		}

		thishgrid.move = function(object, gridspriteid) {
			var count = 0;
			var x = object && object.x;
			if ((x >= 0) && (x < thishgrid.width)) {
				var ii = Math.floor(x * thishgrid.slices / thishgrid.width);
				for (var iii = 0; iii < thishgrid.slices; ++iii) {
					if (ii == iii) {
						if (gridspriteid in thishgrid[iii]) {
							thishgrid[iii][gridspriteid] = object;
						} else {
							thishgrid[iii][gridspriteid] = object;
							++count;
						}
					} else {
						if (gridspriteid in thishgrid[iii]) {
							delete thishgrid[iii][gridspriteid];
							--count;
						}
					}
				}
			}
			return count;
		}
		thishgrid.check2 = function(sprite, gridsprite, delta_x, delta_y) {
			if (gridsprite.visible) {
				if (Math.abs(sprite.x - gridsprite.x) < delta_x) {
					if (Math.abs(sprite.y - gridsprite.y) < delta_y) {
						return true;
					}
				}
			}
			return false;
		}
		thishgrid.check = function(sprite, delta_x, delta_y, cb) {
			var sliceid = thishgrid.getindex(sprite.x);
			if (sliceid - 1 >= 0) {
				for (var gridspriteid in thishgrid[sliceid - 1]) {
					if (thishgrid.check2(sprite, thishgrid[sliceid - 1][gridspriteid], delta_x, delta_y)) {
						if (typeof cb == "function") cb(sprite, thishgrid[sliceid - 1][gridspriteid]);
						return thishgrid[sliceid - 1][gridspriteid];
					}
				}
			}
			for (var gridspriteid in thishgrid[sliceid]) {
				if (thishgrid.check2(sprite, thishgrid[sliceid][gridspriteid], delta_x, delta_y)) {
					if (typeof cb == "function") cb(sprite, thishgrid[sliceid][gridspriteid]);
					return thishgrid[sliceid][gridspriteid];
				}
			}
			if (sliceid + 1 < thishgrid.slices) {
				for (var gridspriteid in thishgrid[sliceid + 1]) {
					if (thishgrid.check2(sprite, thishgrid[sliceid + 1][gridspriteid], delta_x, delta_y)) {
						if (typeof cb == "function") cb(sprite, thishgrid[sliceid + 1][gridspriteid]);
						return thishgrid[sliceid + 1][gridspriteid];
					}
				}
			}
			return null;
		}
		thishgrid.purge = function(object, gridspriteid) {
			var count = 0;
			for (var iii = 0; iii < thishgrid.slices; ++iii) {
				if (gridspriteid in thishgrid[iii]) {
					delete thishgrid[iii][gridspriteid];
				}
			}
			return count;
		}

		thishgrid.getindex = function(x) {
			if ((x >= 0) && (x < thishgrid.width)) {
				var ii = Math.floor(x * thishgrid.slices / thishgrid.width);
				return ii;
			}
		}

		return thishgrid;
	}

	
	
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

	var $path = {};
	$path.collisionhgrid = collisionhgrid;
	$path.spline = spline;
	window.$path = $path;
})();



