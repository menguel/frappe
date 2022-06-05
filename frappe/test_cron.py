from ast import For
import frappe
from frappe.model.docstatus import DocStatus

def cron():
    datas = frappe.db.get_all('Candidats', fields=['user','program','cohort', 'amended_from'])
    
    for record in datas:
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

            print("Done !")