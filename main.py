# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import sys
import itertools
from django import template as django_template
from django.conf import settings as django_settings

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT_DIR, "data")
OUTPUT_DIR = os.path.join(ROOT_DIR, "output")
PAYLOAD_FPATH = os.path.join(DATA_DIR, "payloads.txt")
TEMPLATE_FPATH = os.path.join(DATA_DIR, "templates.txt")
OUTPUT_FPATH = os.path.join(OUTPUT_DIR, "output.txt")

# Build a list collecting all the output file names
OUTPUT_LIST = []

# We must set up a django configuration before we can even use
# django's template engine.
# See http://stackoverflow.com/a/98178/230884
django_settings.configure()

def create_html(html, filename):
    """Writes HTML string into HTML file.

    Args:
        html: fully rendered HTML string
    """
    with open(os.path.join(OUTPUT_DIR, filename), "w+") as f:
        f.write(html)

def use_django(test_tuple, t_index, p_index):
    """Renders template into HTML using Django's template system
       and writes the HTML string into a HTML file.

    Args:
        test_tuple: a tuple consists of the template string,
            and the context string (which is used to replace
            any context variable in the template)
        t_index: the index of the current template in the template file
        p_index: the index of the current payload (or context string)
            in the payload file
    """
    html = use_django_render(test_tuple)
    file_name = "{}_{}_django.html".format(t_index, p_index)
    create_html(html, file_name)
    global OUTPUT_LIST
    OUTPUT_LIST.append(file_name)

def use_django_render(test_tuple):
    """Renders template into HTML using Django's template system.

    Args:
        test_tuple: a tuple consists of the template string,
            and the context string (which is used to replace
            any context variable in the template)

    Returns:
        A rendered HTML string.
    """
    t = django_template.Template(test_tuple[0])
    c = django_template.Context({"payload": test_tuple[1]})
    return t.render(c)

def create_htmls():
    """Create HTML from a list of payloads and HTML templates."""

    _templates = open(TEMPLATE_FPATH, "r")
    _payloads = open(PAYLOAD_FPATH, "r")

    # We will make a cartesian product.
    # The number of files = |templates| x |payloads|
    # See https://docs.python.org/2/library/itertools.html#itertools.product
    # The filename is named as <templates.index>_<payloads.index>_[django/mako/jinja].html

    # To calculate the index of each corresponding item in the tuple,
    # we keep track of the string we are reading.
    curr_t = None
    t_index = p_index = -1

    for test in itertools.product(_templates, _payloads):
        # Template stays the same so still looping payload
        if curr_t == test[0]:
            p_index += 1
        # Encounter a new template string, reset p_index
        else:
            p_index = 0
            t_index += 1
            curr_t = test[0]

        # Calls the different template engine here
        use_django(test, t_index, p_index)

    # Closing off the file descriptors!
    _templates.close()
    _payloads.close()

    global OUTPUT_LIST
    with open(OUTPUT_FPATH, "w+") as f:
        for fname in OUTPUT_LIST:
            f.write(fname+"\n")

if __name__ == "__main__":
    create_htmls()
