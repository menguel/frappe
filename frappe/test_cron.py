import frappe

def cron():
    test = frappe.get_doc({"doctype": "test_cron",
        "test": "test"
    })

    test.insert()
    frappe.db.commit()