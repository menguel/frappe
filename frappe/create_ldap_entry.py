from datetime import datetime
import frappe
from frappe.model.docstatus import DocStatus

def create():
    datas = frappe.db.get_all('Candidats', fields=['user','program','cohort', 'amended_from','docstatus'])
    date_now = datetime.strptime(frappe.utils.nowdate(), '%Y-%m-%d').date()
    for record in datas:
        cohort = frappe.get_doc("Cohort", record.cohort)

        if cohort.start_date == date_now:
            if record.docstatus == DocStatus.submitted():
                user = frappe.get_doc("User", record.user)
                first_name = user.first_name.split(" ")[0].lower()
                last_name = user.last_name.split(" ")[0].lower()
                ldap = frappe.get_doc("LDAP Settings")
                url = ldap.ldap_server_url.replace("ldap://ldap.", "").split(":")[0]

                ldap_user = {}
                ldap_user['username'] = first_name[0] + last_name 
                ldap_user['firstname'] = first_name
                ldap_user['lastname'] = last_name
                ldap_user['email'] = ldap_user['username'] + "@" + url
                ldap_user['password'] = ldap_user['username']

                ldap.create_ldap_user(ldap_user)
                print("Done")

                frappe.sendmail(
                    recipients=user,
                    subject='Email de bienvenue',
                    template='credentials_email',
                    args=dict(
                        name=user.full_name,
                        sexe = user.gender,
                        username=ldap_user.username,
                        password=ldap_user.password
                    ),
                    header='BIENVENUE DANS LA COMMUNAUTÉ IREX'
                )



def test():

    test = frappe.get_doc({
        'doctype': 'test_cron',
        'test': 'test'
    })
    test.insert()
    frappe.db.commit()
