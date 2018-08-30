var request = require('request');

const token = '';
const baseUrl = 'https://api.telegram.org/bot' + token + '/';

const morpherUrl = '';


module.exports = function(context, cb) {
    var res = context;
    // console.log(`${JSON.stringify(context)}`);
    if (context.body) {
        var msg;
        var inline_query;
        if (context.body.message) {
            msg = context.body.message;
        } else if (context.body.edited_message) {
            msg = context.body.edited_message;
        }
        if (msg) {
            var command = msg.text;
            var chat = msg.chat.id;
            var message_id = msg.message_id;

            res = sendMessage(chat, message_id,  command);
        }
        if ((inline_query = context.body.inline_query)
                        && inline_query.query !== '' ) {
            res = inlineQuery(inline_query);
        }
    }
    cb(null, res);
};

var mongoObjectId = function () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'
        .replace(/[x]/g, () =>(Math.random() * 16 | 0).toString(16))
        .toLowerCase();
};

// var getBashOrg = function(q) {
//     const id = Math.round(Math.random() * 451892);
//     const url = `https://bash.im/quote/${id}`;
//     var response = "12";
//     request.get(url,
//         (err, resp, body) => {
//             console.log(JSON.stringify(body))
//             var xx = resp.send(200, body);
//             // response = body;
//             return xx;
//         });
//     return response;
// }

var inlineQuery = function(inline_query) {
    // console.log(`q: ${JSON.stringify(inline_query)}`);
    var tokenized = inline_query.query.split(' ');
    var results = [];
    if (inline_query.query.startsWith('bor')) {
        results = tokenized.slice(1).map(x=>{
            // const text = getBashOrg(x);
            // console.log(text);
            return {
                id: mongoObjectId(),
                type: 'article',
                title: `%D0%98%D1%81%D0%BA%D0%B0%D1%82%D1%8C ${x}`, // urlencoded "Искать"
                description: `%D0%9E%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5%20 ${x}`, // urlencoded "Описание"
                url: `https://bash.im/quote/${x}`,
                input_message_content: {
                    type: 'text',
                    message_text: `https://bash.im/quote/${x}`,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                }
            };
        });
    } else {
        results = tokenized.map(x=>{
            return {
                id: mongoObjectId(),
                type: 'article',
                title: `%D0%98%D1%81%D0%BA%D0%B0%D1%82%D1%8C ${x}`, // urlencoded "Искать"
                description: `%D0%9E%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5%20 ${x}`, // urlencoded "Описание"
                url: `https://yandex.ru?q=${x}`,
                input_message_content: {
                    type: 'text',
                    message_text: x,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                }
            };
        });
    }

    request.post(
        baseUrl + `answerInlineQuery?cache_time=0&is_personal=true&inline_query_id=${inline_query.id}&results=${JSON.stringify(results)}`,
        (err, response) => {
            // console.log(`err: ${err}, ${JSON.stringify(response)}`)
            return response;
        });
}

var sendMessage = function(chatId, sourceMessageId, message) {
    console.log(`${chatId}, ${sourceMessageId}, msg:${message}`);
    if (message !== undefined) {
        var msg = message;
        if (message.startsWith('/')) {
            msg = message.substring(1);
        }
        const tokens = msg.split('\s,.');
        const additionalTokens = tokens.map(x => {
            if (x.match(/.*(сь|ся)/)) {
                return x.replace(/(.*)(сь|ся)/,'$1');
            }
            return undefined;
        })
            .filter(v=>v!=undefined);
        tokens.append(additionalTokens);
        
        const wordForm = request.post(
            morpherUrl,
            {
                gender: 'femn',
                words: tokens
            },
            (err,response) => {
                return response;
            }
        );
        tokens = tokens.replace(wordForm.orig, wordForm.modified);
        

        request.post(
            baseUrl + 'sendMessage',
            {
                form: {
                    'chat_id': chatId,
                    'from_chat_id': chatId,
                    'message_id': sourceMessageId,
                    'text': msg
                }
            },
            (err, response) => {
                return response;
            }
        );
    }
};
