// login.js
// don't remove this line (used in test)



// Interest Part
const data = [
	{ id: 0, text: 'Développement web' },
	{ id: 1, text: 'Analyse d\'affaire' },
	{ id: 2, text: 'Marketing' },
	{ id: 3, text: 'UI/UX' },
	{ id: 4, text: 'DevOps' },
	{ id: 5, text: 'IOT' },
	{ id: 6, text: 'Big Data' },
];

let interests = "";

$(function () {
	const select = $('#interests');
	select.select2({
		placeholder: 'centre(s) d\'intérêt',
		data: data
	})
		.on('change', (event) => {
			$('section:visible .page-card-body').removeClass("invalid_interests");
			const selecions = select.select2('data')
				.map((element) => element.text);
			interests = selecions.join(', ');

		});
});


$('.label.ui.dropdown')
	.dropdown();

$('.no.label.ui.dropdown')
	.dropdown({
		useLabels: false
	});

$('.ui.button').on('click', function () {
	$('.ui.dropdown')
		.dropdown('restore defaults')
})


// For Phone Number
var css = document.createElement("link");
css.rel = 'stylesheet';
css.type = "text/css";
css.href = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css";
document.head.appendChild(css);

let phoneInput;

$.getScript("https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js", function () {
	function getIp(callback) {
		fetch('https://ipinfo.io?token=dca861fed9747a', { headers: { 'Accept': 'application/json' } })
			.then((resp) => resp.json())
			.catch(() => {
				return {
					country: 'us',
				};
			})
			.then((resp) => callback(resp.country));
	}
	const phoneInputField = document.querySelector("#signup_mobile_no");
	const phoneInput2 = window.intlTelInput(phoneInputField, {
		initialCountry: "auto",
		geoIpLookup: getIp,
		utilsScript:
			"https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
	});
	phoneInput = phoneInput2;
});

// For convert file
function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
}

// For cv file
$(function () {
	$("#cv").change(function () {
		$("#filename").text($(this).val().replace(/.*(\/|\\)/, ''));
	});
});


window.disable_signup = {{ disable_signup and "true" or "false" }};

window.login = {};

window.verify = {};

login.bind_events = function () {
	$(window).on("hashchange", function () {
		login.route();
	});


	$(".form-login").on("submit", function (event) {
		event.preventDefault();
		var args = {};
		args.cmd = "login";
		args.usr = frappe.utils.xss_sanitise(($("#login_email").val() || "").trim());
		args.pwd = $("#login_password").val();
		args.device = "desktop";
		if (!args.usr || !args.pwd) {
			frappe.msgprint('{{ _("Both login and password required") }}');
			return false;
		}
		login.call(args);
		return false;
	});

	$(".form-signup").on("submit", function (event) {
		event.preventDefault();
		var gender_check = document.querySelector("input[name=gender]:checked");
		var args = {};
		args.cmd = "frappe.core.doctype.user.user.sign_up";
		args.email = ($("#signup_email").val() || "").trim();
		args.birth_date = ($("#birth_date").val() || "").trim();
		args.bio = ($("#bio").val() || "").trim();
		args.cv = document.getElementById('cv').files[0];
		args.interests = (interests || "");
		args.mobile_no = (phoneInput.getNumber() || "").trim();
		args.situation = $("#signup_situation").val() || ""
		args.gender = (gender_check ? gender_check.value : "").trim();
		args.location = (phoneInput.getSelectedCountryData().name || "").trim();
		args.redirect_to = frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to"));
		args.last_name = frappe.utils.xss_sanitise(($("#signup_lastname").val() || "").trim());
		args.first_name = frappe.utils.xss_sanitise(($("#signup_firstname").val() || "").trim());
		const size = (args.cv.size / 1024 / 1024).toFixed(2);
		if (!args.email || !validate_email(args.email) || !args.first_name || !args.mobile_no) {
			login.set_status('{{ _("Valid email and name required") }}', 'red');
			frappe.msgprint('les infos ne sont pas correctes !');
			return false;
		} else if (!phoneInput.isValidNumber()) {
			login.set_status_require_phone("Le téléphone n'est pas valide", 'red');
			return false;
		} else if (args.situation === "vide") {
			$('section:visible .page-card-body').removeClass("invalid_phone");
			login.set_status_require_situation("Choisir une situation professionnelle.", 'red');
			return false;
		} else if (args.interests === "") {
			$('section:visible .page-card-body').removeClass("invalid_phone");
			$('section:visible .page-card-body').removeClass("invalid_situation");
			login.set_status_require_interests("Choisir au moins un centre d'intérêt.", 'red');
			return false;
		} else if (!args.cv) {
			login.set_status_require_cv("Veuillez joindre un cv s’il vous plaît !", 'red');
			return false;
		} else if (args.cv.type !== "application/pdf") {
			login.set_status_require_cv("Le fichier cv doit etre un pdf !", 'red');
			return false;
		} else if (size > 2) {
			login.set_status_require_cv("Le cv doit etre moins de 2 Mo. actuel: " + size + "Mo", 'red');
			return false;
		}
		getBase64(document.getElementById('cv').files[0]).then(
			data => {
				args.cv = data;
				login.call(args);
				return false;
			}
		);
		//console.log(args);


	});

	$(".form-forgot").on("submit", function (event) {
		event.preventDefault();
		var args = {};
		args.cmd = "frappe.core.doctype.user.user.reset_password";
		args.user = ($("#forgot_email").val() || "").trim();
		if (!args.user) {
			login.set_status('{{ _("Valid Login id required.") }}', 'red');
			return false;
		}
		login.call(args);
		return false;
	});

	$(".toggle-password").click(function () {
		var input = $($(this).attr("toggle"));
		if (input.attr("type") == "password") {
			input.attr("type", "text");
			$(this).text('{{ _("Hide") }}')
		} else {
			input.attr("type", "password");
			$(this).text('{{ _("Show") }}')
		}
	});

	{% if ldap_settings and ldap_settings.enabled %}
	$(".btn-ldap-login").on("click", function () {
		var args = {};
		args.cmd = "{{ ldap_settings.method }}";
		args.usr = ($("#login_email").val() || "").trim();
		args.pwd = $("#login_password").val();
		args.device = "desktop";
		if (!args.usr || !args.pwd) {
			login.set_status('{{ _("Both login and password required") }}', 'red');
			return false;
		}
		login.call(args);
		return false;
	});
	{% endif %}
}




login.route = function () {
	var route = window.location.hash.slice(1);
	if (!route) route = "login";
	login[route]();
}

login.reset_sections = function (hide) {
	if (hide || hide === undefined) {
		$("section.for-login").toggle(false);
		$("section.for-email-login").toggle(false);
		$("section.for-forgot").toggle(false);
		$("section.for-signup").toggle(false);
	}
	$('section:not(.signup-disabled) .indicator').each(function () {
		$(this).removeClass().addClass('indicator').addClass('blue')
			.text($(this).attr('data-text'));
	});
}

login.login = function () {
	login.reset_sections();
	$(".for-login").toggle(true);
}

login.email = function () {
	login.reset_sections();
	$(".for-email-login").toggle(true);
	$("#login_email").focus();
}

login.steptwo = function () {
	login.reset_sections();
	$(".for-login").toggle(true);
	$("#login_email").focus();
}

login.forgot = function () {
	login.reset_sections();
	$(".for-forgot").toggle(true);
	$("#forgot_email").focus();
}

login.signup = function () {
	login.reset_sections();
	$(".for-signup").toggle(true);
	$("#signup_fullname").focus();
}


// Login
login.call = function (args, callback) {
	login.set_status('{{ _("Verifying...") }}', 'blue');

	return frappe.call({
		type: "POST",
		args: args,
		callback: callback,
		freeze: true,
		statusCode: login.login_handlers
	});
}

login.set_status = function (message, color) {
	$('section:visible .btn-primary').text(message)
	if (color == "red") {
		$('section:visible .page-card-body').addClass("invalid");
	}
}

login.set_status_require_phone = function (message, color) {
	$('section:visible .btn-primary').text(message)
	if (color == "red") {
		$('section:visible .page-card-body').addClass("invalid_phone");
	}
}

login.set_status_require_situation = function (message, color) {
	$('section:visible .btn-primary').text(message)
	if (color == "red") {
		$('section:visible .page-card-body').addClass("invalid_situation");
	}
}

login.set_status_require_interests = function (message, color) {
	$('section:visible .btn-primary').text(message)
	if (color == "red") {
		$('section:visible .page-card-body').addClass("invalid_interests");
	}
}

login.set_status_require_gender = function (message, color) {
	$('section:visible .btn-primary').text(message)
	if (color == "red") {
		$('section:visible .page-card-body').addClass("invalid_gender");
	}
}

login.set_status_require_cv = function (message, color) {
	$('section:visible .btn-primary').text(message)
	if (color == "red") {
		$('section:visible .page-card-body').addClass("invalid_cv");
	}
}


login.set_invalid = function (message) {
	$(".login-content.page-card").addClass('invalid-login');
	setTimeout(() => {
		$(".login-content.page-card").removeClass('invalid-login');
	}, 500)
	login.set_status(message, 'red');
	$("#login_password").focus();
}

login.login_handlers = (function () {
	var get_error_handler = function (default_message) {
		return function (xhr, data) {
			if (xhr.responseJSON) {
				data = xhr.responseJSON;
			}

			var message = default_message;
			if (data._server_messages) {
				message = ($.map(JSON.parse(data._server_messages || '[]'), function (v) {
					// temp fix for messages sent as dict
					try {
						return JSON.parse(v).message;
					} catch (e) {
						return v;
					}
				}) || []).join('<br>') || default_message;
			}

			if (message === default_message) {
				login.set_invalid(message);
			} else {
				login.reset_sections(false);
			}

		};
	}

	var login_handlers = {
		200: function (data) {
			if (data.message == 'Logged In') {
				login.set_status('{{ _("Success") }}', 'green');
				window.location.href = frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to")) || data.home_page;
			} else if (data.message == 'Password Reset') {
				window.location.href = frappe.utils.sanitise_redirect(data.redirect_to);
			} else if (data.message == "No App") {
				login.set_status("{{ _('Success') }}", 'green');
				if (localStorage) {
					var last_visited =
						localStorage.getItem("last_visited")
						|| frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to"));
					localStorage.removeItem("last_visited");
				}

				if (data.redirect_to) {
					window.location.href = frappe.utils.sanitise_redirect(data.redirect_to);
				}

				if (last_visited && last_visited != "/login") {
					window.location.href = last_visited;
				} else {
					window.location.href = data.home_page;
				}
			} else if (window.location.hash === '#forgot') {
				if (data.message === 'not found') {
					login.set_status('{{ _("Not a valid user") }}', 'red');
				} else if (data.message == 'not allowed') {
					login.set_status('{{ _("Not Allowed") }}', 'red');
				} else if (data.message == 'disabled') {
					login.set_status('{{ _("Not Allowed: Disabled User") }}', 'red');
				} else {
					login.set_status('{{ _("Instructions Emailed") }}', 'green');
				}


			} else if (window.location.hash === '#signup') {
				if (cint(data.message[0]) == 0) {
					login.set_status(data.message[1], 'red');
				} else {
					login.set_status('{{ _("Success") }}', 'green');
					frappe.msgprint(data.message[1])
					setTimeout(() => {
						window.location.href = "/lms";
					}, 3000)
				}
				//login.set_status(__(data.message), 'green');
			}

			//OTP verification
			if (data.verification && data.message != 'Logged In') {
				login.set_status('{{ _("Success") }}', 'green');

				document.cookie = "tmp_id=" + data.tmp_id;

				if (data.verification.method == 'OTP App') {
					continue_otp_app(data.verification.setup, data.verification.qrcode);
				} else if (data.verification.method == 'SMS') {
					continue_sms(data.verification.setup, data.verification.prompt);
				} else if (data.verification.method == 'Email') {
					continue_email(data.verification.setup, data.verification.prompt);
				}
			}
		},
		401: get_error_handler('{{ _("Invalid Login. Try again.") }}'),
		417: get_error_handler('{{ _("Oops! Something went wrong") }}')
	};

	return login_handlers;
})();

frappe.ready(function () {

	login.bind_events();

	if (!window.location.hash) {
		window.location.hash = "#login";
	} else {
		$(window).trigger("hashchange");
	}

	$(".form-signup, .form-forgot").removeClass("hide");
	$(document).trigger('login_rendered');
});

var verify_token = function (event) {
	$(".form-verify").on("submit", function (eventx) {
		eventx.preventDefault();
		var args = {};
		args.cmd = "login";
		args.otp = $("#login_token").val();
		args.tmp_id = frappe.get_cookie('tmp_id');
		if (!args.otp) {
			frappe.msgprint('{{ _("Login token required") }}');
			return false;
		}
		login.call(args);
		return false;
	});
}

var request_otp = function (r) {
	$('.login-content').empty();
	$('.login-content:visible').append(
		`<div id="twofactor_div">
			<form class="form-verify">
				<div class="page-card-head">
					<span class="indicator blue" data-text="Verification">{{ _("Verification") }}</span>
				</div>
				<div id="otp_div"></div>
				<input type="text" id="login_token" autocomplete="off" class="form-control" placeholder={{ _("Verification Code") }} required="" autofocus="">
				<button class="btn btn-sm btn-primary btn-block mt-3" id="verify_token">{{ _("Verify") }}</button>
			</form>
		</div>`
	);
	// add event handler for submit button
	verify_token();
}

var continue_otp_app = function (setup, qrcode) {
	request_otp();
	var qrcode_div = $('<div class="text-muted" style="padding-bottom: 15px;"></div>');

	if (setup) {
		direction = $('<div>').attr('id', 'qr_info').text('{{ _("Enter Code displayed in OTP App.") }}');
		qrcode_div.append(direction);
		$('#otp_div').prepend(qrcode_div);
	} else {
		direction = $('<div>').attr('id', 'qr_info').html('{{ _("OTP setup using OTP App was not completed. Please contact Administrator.") }}');
		qrcode_div.append(direction);
		$('#otp_div').prepend(qrcode_div);
	}
}

var continue_sms = function (setup, prompt) {
	request_otp();
	var sms_div = $('<div class="text-muted" style="padding-bottom: 15px;"></div>');

	if (setup) {
		sms_div.append(prompt)
		$('#otp_div').prepend(sms_div);
	} else {
		direction = $('<div>').attr('id', 'qr_info').html(prompt || '{{ _("SMS was not sent. Please contact Administrator.") }}');
		sms_div.append(direction);
		$('#otp_div').prepend(sms_div)
	}
}

var continue_email = function (setup, prompt) {
	request_otp();
	var email_div = $('<div class="text-muted" style="padding-bottom: 15px;"></div>');

	if (setup) {
		email_div.append(prompt)
		$('#otp_div').prepend(email_div);
	} else {
		var direction = $('<div>').attr('id', 'qr_info').html(prompt || '{{ _("Verification code email not sent. Please contact Administrator.") }}');
		email_div.append(direction);
		$('#otp_div').prepend(email_div);
	}
}


