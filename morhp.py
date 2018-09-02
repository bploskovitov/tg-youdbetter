# A very simple Flask Hello World app for you to get started with...

from flask import Flask
from flask import request
from flask import Response
from pymorphy2 import MorphAnalyzer
from flask import jsonify

app = Flask(__name__)
morph = MorphAnalyzer()

def first_verb_in_past_form(words, gender):
    for word in words:
        word_forms = morph.parse(word)
        found = ('VERB' in word_forms[0].tag and 'perf' in word_forms[0].tag and 'tran' in word_forms[0].tag and
                 'sing' in word_forms[0].tag and 'impr' in word_forms[0].tag and 'excl' in word_forms[0].tag)
        if found:
            pastForm = [x for x in word_forms[0].lexeme if gender in x.tag and 'past' in x.tag and 'indc' in x.tag][0].word
            return {'orig':word, 'modified':pastForm}
    return ''

@app.route('/morph', methods=['POST'])
def morhp():
    req = request.json
    gender = req['gender']
    words = req['words']
    content = jsonify(first_verb_in_past_form(words, gender))
    return content, 200, {'Content-Type': 'application/json; charset=utf-8'}
