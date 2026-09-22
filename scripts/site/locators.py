"""Conservative PDF locators: printed labels must be footer-shaped, not UN symbols."""
import re

def printed_page(text):
    labels = re.findall(r'(?m)^[ \t]*(?:\d{2}-\d{4,6}[ \t]+)?(\d{1,4})[ \t]*/[ \t]*\d{1,4}(?:[ \t]+\d{2}-\d{4,6})?[ \t]*$', text)
    return int(labels[-1]) if labels else None
