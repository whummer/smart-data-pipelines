(function() {

	var x = window;

	x.trim = function(str, length) {
		if(!str) return str;

		//trim the string to the maximum length
		var trimmed = str.substr(0, length);
		if(trimmed.length < str.length) {
			//re-trim if we are in the middle of a word
			var idx = Math.min(trimmed.length, trimmed.lastIndexOf(" "));
			if(idx > 0) trimmed = trimmed.substr(0, idx);
			// add dots
			trimmed += "...";
		}
		return trimmed;
	}

	/* String.startsWith(..) */
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
			return this.slice(0, str.length) == str;
		};
	}

	/* String.endsWith(..) */
	if (typeof String.prototype.endsWith != 'function') {
		String.prototype.endsWith = function (str){
			return this.slice(-str.length) == str;
		};
	}

	/* String.contains(..) */
	String.prototype.contains = function(it) {
		return this.indexOf(it) != -1;
	};

	/* bound(..) for numbers */
	x.bound = function(value, opt_min, opt_max) {
		value = Math.max(value, opt_min);
		value = Math.min(value, opt_max);
		return value;
	}

	/* Date.prototype.toString */
	if(!Date.prototype.toStringOriginal) {
		Date.prototype.toStringOriginal = Date.prototype.toString;
	}
	Date.prototype.toString = function() {
		if(this.toStringFormat) {
		    return formatDate(this, this.toStringFormat);
		}
		return this.toStringOriginal();
	}

	/* from http://stackoverflow.com/questions/14638018/current-time-formatting-with-javascript */
	x.formatDate = function(date, format, utc) {
		if(!date) {
			return null;
		}
		if(!format) {
			format = "yyyy-MM-dd HH:mm:ss";
		}
		if(typeof date == "string") {
			date = new Date(date);
		}
		if(typeof date == "number") {
			date = new Date(date);
		}

	    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	    function ii(i, len) {
	        var s = i + "";
	        len = len || 2;
	        while (s.length < len) s = "0" + s;
	        return s;
	    }

	    var y = utc ? date.getUTCFullYear() : date.getFullYear();
	    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
	    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
	    format = format.replace(/(^|[^\\])y/g, "$1" + y);

	    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
	    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
	    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
	    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
	    format = format.replace(/(^|[^\\])M/g, "$1" + M);

	    var d = utc ? date.getUTCDate() : date.getDate();
	    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
	    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
	    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
	    format = format.replace(/(^|[^\\])d/g, "$1" + d);

	    var H = utc ? date.getUTCHours() : date.getHours();
	    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
	    format = format.replace(/(^|[^\\])H/g, "$1" + H);

	    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
	    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
	    format = format.replace(/(^|[^\\])h/g, "$1" + h);

	    var m = utc ? date.getUTCMinutes() : date.getMinutes();
	    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
	    format = format.replace(/(^|[^\\])m/g, "$1" + m);

	    var s = utc ? date.getUTCSeconds() : date.getSeconds();
	    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
	    format = format.replace(/(^|[^\\])s/g, "$1" + s);

	    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
	    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
	    f = Math.round(f / 10);
	    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
	    f = Math.round(f / 10);
	    format = format.replace(/(^|[^\\])f/g, "$1" + f);

	    var T = H < 12 ? "AM" : "PM";
	    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
	    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

	    var t = T.toLowerCase();
	    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
	    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

	    var tz = -date.getTimezoneOffset();
	    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
	    if (!utc) {
	        tz = Math.abs(tz);
	        var tzHrs = Math.floor(tz / 60);
	        var tzMin = tz % 60;
	        K += ii(tzHrs) + ":" + ii(tzMin);
	    }
	    format = format.replace(/(^|[^\\])K/g, "$1" + K);

	    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
	    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
	    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

	    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
	    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

	    format = format.replace(/\\(.)/g, "$1");

	    return format;
	};

	/* read a cookie value */
	x.readCookie = function(name) {
		var c = document.cookie.split('; ');
		var cookies = {};
		for(i = 0; i < c.length; i++) {
			var C = c[i].split('=');
			cookies[C[0]] = C[1];
		}
		return cookies[name];
	}
	x.writeCookie = function(name, value) {
		document.cookie = name + "=" + (((typeof value == "undefined") || (value == null)) ? "" : value);
	}
	x.deleteCookie = function(name) {
		var expiry = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
		document.cookie = name + "=;" + expiry;
	}

	/* turn a relative URL into an absolute URL 
	 * http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
	 */
	x.resolve = function(url, base_url) {
		var doc    = document
		, old_base = doc.getElementsByTagName('base')[0]
		, old_href = old_base && old_base.href
		, doc_head = doc.head || doc.getElementsByTagName('head')[0]
		, our_base = old_base || doc_head.appendChild(doc.createElement('base'))
		, resolver = doc.createElement('a')
		, resolved_url;

		our_base.href = base_url;
		resolver.href = url;
		resolved_url  = resolver.href; // browser magic at work here
		
		if (old_base) old_base.href = old_href;
		else doc_head.removeChild(our_base);
		return resolved_url;
	}

	/* deep-copy clone of an arbitrary object */
	x.clone = function(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	x.ISO_3166_COUNTRIES = {
	    'AF' : 'Afghanistan',
	    'AX' : 'Aland Islands',
	    'AL' : 'Albania',
	    'DZ' : 'Algeria',
	    'AS' : 'American Samoa',
	    'AD' : 'Andorra',
	    'AO' : 'Angola',
	    'AI' : 'Anguilla',
	    'AQ' : 'Antarctica',
	    'AG' : 'Antigua And Barbuda',
	    'AR' : 'Argentina',
	    'AM' : 'Armenia',
	    'AW' : 'Aruba',
	    'AU' : 'Australia',
	    'AT' : 'Austria',
	    'AZ' : 'Azerbaijan',
	    'BS' : 'Bahamas',
	    'BH' : 'Bahrain',
	    'BD' : 'Bangladesh',
	    'BB' : 'Barbados',
	    'BY' : 'Belarus',
	    'BE' : 'Belgium',
	    'BZ' : 'Belize',
	    'BJ' : 'Benin',
	    'BM' : 'Bermuda',
	    'BT' : 'Bhutan',
	    'BO' : 'Bolivia',
	    'BA' : 'Bosnia And Herzegovina',
	    'BW' : 'Botswana',
	    'BV' : 'Bouvet Island',
	    'BR' : 'Brazil',
	    'IO' : 'British Indian Ocean Territory',
	    'BN' : 'Brunei Darussalam',
	    'BG' : 'Bulgaria',
	    'BF' : 'Burkina Faso',
	    'BI' : 'Burundi',
	    'KH' : 'Cambodia',
	    'CM' : 'Cameroon',
	    'CA' : 'Canada',
	    'CV' : 'Cape Verde',
	    'KY' : 'Cayman Islands',
	    'CF' : 'Central African Republic',
	    'TD' : 'Chad',
	    'CL' : 'Chile',
	    'CN' : 'China',
	    'CX' : 'Christmas Island',
	    'CC' : 'Cocos (Keeling) Islands',
	    'CO' : 'Colombia',
	    'KM' : 'Comoros',
	    'CG' : 'Congo',
	    'CD' : 'Congo, Democratic Republic',
	    'CK' : 'Cook Islands',
	    'CR' : 'Costa Rica',
	    'CI' : 'Cote D\'Ivoire',
	    'HR' : 'Croatia',
	    'CU' : 'Cuba',
	    'CY' : 'Cyprus',
	    'CZ' : 'Czech Republic',
	    'DK' : 'Denmark',
	    'DJ' : 'Djibouti',
	    'DM' : 'Dominica',
	    'DO' : 'Dominican Republic',
	    'EC' : 'Ecuador',
	    'EG' : 'Egypt',
	    'SV' : 'El Salvador',
	    'GQ' : 'Equatorial Guinea',
	    'ER' : 'Eritrea',
	    'EE' : 'Estonia',
	    'ET' : 'Ethiopia',
	    'FK' : 'Falkland Islands (Malvinas)',
	    'FO' : 'Faroe Islands',
	    'FJ' : 'Fiji',
	    'FI' : 'Finland',
	    'FR' : 'France',
	    'GF' : 'French Guiana',
	    'PF' : 'French Polynesia',
	    'TF' : 'French Southern Territories',
	    'GA' : 'Gabon',
	    'GM' : 'Gambia',
	    'GE' : 'Georgia',
	    'DE' : 'Germany',
	    'GH' : 'Ghana',
	    'GI' : 'Gibraltar',
	    'GR' : 'Greece',
	    'GL' : 'Greenland',
	    'GD' : 'Grenada',
	    'GP' : 'Guadeloupe',
	    'GU' : 'Guam',
	    'GT' : 'Guatemala',
	    'GG' : 'Guernsey',
	    'GN' : 'Guinea',
	    'GW' : 'Guinea-Bissau',
	    'GY' : 'Guyana',
	    'HT' : 'Haiti',
	    'HM' : 'Heard Island & Mcdonald Islands',
	    'VA' : 'Holy See (Vatican City State)',
	    'HN' : 'Honduras',
	    'HK' : 'Hong Kong',
	    'HU' : 'Hungary',
	    'IS' : 'Iceland',
	    'IN' : 'India',
	    'ID' : 'Indonesia',
	    'IR' : 'Iran, Islamic Republic Of',
	    'IQ' : 'Iraq',
	    'IE' : 'Ireland',
	    'IM' : 'Isle Of Man',
	    'IL' : 'Israel',
	    'IT' : 'Italy',
	    'JM' : 'Jamaica',
	    'JP' : 'Japan',
	    'JE' : 'Jersey',
	    'JO' : 'Jordan',
	    'KZ' : 'Kazakhstan',
	    'KE' : 'Kenya',
	    'KI' : 'Kiribati',
	    'KR' : 'Korea',
	    'KW' : 'Kuwait',
	    'KG' : 'Kyrgyzstan',
	    'LA' : 'Lao People\'s Democratic Republic',
	    'LV' : 'Latvia',
	    'LB' : 'Lebanon',
	    'LS' : 'Lesotho',
	    'LR' : 'Liberia',
	    'LY' : 'Libyan Arab Jamahiriya',
	    'LI' : 'Liechtenstein',
	    'LT' : 'Lithuania',
	    'LU' : 'Luxembourg',
	    'MO' : 'Macao',
	    'MK' : 'Macedonia',
	    'MG' : 'Madagascar',
	    'MW' : 'Malawi',
	    'MY' : 'Malaysia',
	    'MV' : 'Maldives',
	    'ML' : 'Mali',
	    'MT' : 'Malta',
	    'MH' : 'Marshall Islands',
	    'MQ' : 'Martinique',
	    'MR' : 'Mauritania',
	    'MU' : 'Mauritius',
	    'YT' : 'Mayotte',
	    'MX' : 'Mexico',
	    'FM' : 'Micronesia, Federated States Of',
	    'MD' : 'Moldova',
	    'MC' : 'Monaco',
	    'MN' : 'Mongolia',
	    'ME' : 'Montenegro',
	    'MS' : 'Montserrat',
	    'MA' : 'Morocco',
	    'MZ' : 'Mozambique',
	    'MM' : 'Myanmar',
	    'NA' : 'Namibia',
	    'NR' : 'Nauru',
	    'NP' : 'Nepal',
	    'NL' : 'Netherlands',
	    'AN' : 'Netherlands Antilles',
	    'NC' : 'New Caledonia',
	    'NZ' : 'New Zealand',
	    'NI' : 'Nicaragua',
	    'NE' : 'Niger',
	    'NG' : 'Nigeria',
	    'NU' : 'Niue',
	    'NF' : 'Norfolk Island',
	    'MP' : 'Northern Mariana Islands',
	    'NO' : 'Norway',
	    'OM' : 'Oman',
	    'PK' : 'Pakistan',
	    'PW' : 'Palau',
	    'PS' : 'Palestinian Territory, Occupied',
	    'PA' : 'Panama',
	    'PG' : 'Papua New Guinea',
	    'PY' : 'Paraguay',
	    'PE' : 'Peru',
	    'PH' : 'Philippines',
	    'PN' : 'Pitcairn',
	    'PL' : 'Poland',
	    'PT' : 'Portugal',
	    'PR' : 'Puerto Rico',
	    'QA' : 'Qatar',
	    'RE' : 'Reunion',
	    'RO' : 'Romania',
	    'RU' : 'Russian Federation',
	    'RW' : 'Rwanda',
	    'BL' : 'Saint Barthelemy',
	    'SH' : 'Saint Helena',
	    'KN' : 'Saint Kitts And Nevis',
	    'LC' : 'Saint Lucia',
	    'MF' : 'Saint Martin',
	    'PM' : 'Saint Pierre And Miquelon',
	    'VC' : 'Saint Vincent And Grenadines',
	    'WS' : 'Samoa',
	    'SM' : 'San Marino',
	    'ST' : 'Sao Tome And Principe',
	    'SA' : 'Saudi Arabia',
	    'SN' : 'Senegal',
	    'RS' : 'Serbia',
	    'SC' : 'Seychelles',
	    'SL' : 'Sierra Leone',
	    'SG' : 'Singapore',
	    'SK' : 'Slovakia',
	    'SI' : 'Slovenia',
	    'SB' : 'Solomon Islands',
	    'SO' : 'Somalia',
	    'ZA' : 'South Africa',
	    'GS' : 'South Georgia And Sandwich Isl.',
	    'ES' : 'Spain',
	    'LK' : 'Sri Lanka',
	    'SD' : 'Sudan',
	    'SR' : 'Suriname',
	    'SJ' : 'Svalbard And Jan Mayen',
	    'SZ' : 'Swaziland',
	    'SE' : 'Sweden',
	    'CH' : 'Switzerland',
	    'SY' : 'Syrian Arab Republic',
	    'TW' : 'Taiwan',
	    'TJ' : 'Tajikistan',
	    'TZ' : 'Tanzania',
	    'TH' : 'Thailand',
	    'TL' : 'Timor-Leste',
	    'TG' : 'Togo',
	    'TK' : 'Tokelau',
	    'TO' : 'Tonga',
	    'TT' : 'Trinidad And Tobago',
	    'TN' : 'Tunisia',
	    'TR' : 'Turkey',
	    'TM' : 'Turkmenistan',
	    'TC' : 'Turks And Caicos Islands',
	    'TV' : 'Tuvalu',
	    'UG' : 'Uganda',
	    'UA' : 'Ukraine',
	    'AE' : 'United Arab Emirates',
	    'GB' : 'United Kingdom',
	    'US' : 'United States',
	    'UM' : 'United States Outlying Islands',
	    'UY' : 'Uruguay',
	    'UZ' : 'Uzbekistan',
	    'VU' : 'Vanuatu',
	    'VE' : 'Venezuela',
	    'VN' : 'Viet Nam',
	    'VG' : 'Virgin Islands, British',
	    'VI' : 'Virgin Islands, U.S.',
	    'WF' : 'Wallis And Futuna',
	    'EH' : 'Western Sahara',
	    'YE' : 'Yemen',
	    'ZM' : 'Zambia',
	    'ZW' : 'Zimbabwe'
	};

})();