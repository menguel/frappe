from ast import For
from datetime import datetime
import frappe
from frappe.model.docstatus import DocStatus

def create():
    datas = frappe.db.get_all('Candidats', fields=['user','program','cohort', 'amended_from','docstatus'])
    
    for record in datas:
        cohort = frappe.get_doc("Cohort", record.cohort)

        dto = datetime.strptime(frappe.utils.nowdate(), '%Ym-%m-%d').date()
        print(type(cohort.start_date))
        print(type(dto))

        if cohort.start_date == frappe.utils.nowdate():
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