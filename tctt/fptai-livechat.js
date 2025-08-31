var fpt_ai_box_chat_already_load = false
var src_fpt_ai_ifr = ''
var chat_container_id = 'fpt_ai_livechat_display_container'
var chat_floating_button = 'fpt_ai_livechat_button'

// eslint-disable-next-line no-unused-vars
function fpt_ai_render_chatbox (configs, baseUrl, baseWs) {
    var socketUrl = baseWs ? baseWs : 'livechat.fpt.ai:443'
    if (!configs.senderName) {
        configs.senderName = ''
    }
    var subChannel = ''
    if (configs.sub_channel) {
        subChannel = '&subchannel=' + configs.sub_channel
    }
    var customStyle = ''
    if (!configs.styles) {
        // support old script
        configs.styles = {
            headerText: configs.appName,
            floatButtonLogo: configs.logo_button,
            avatarBot: configs.icon_bot,
            customerLogo: 'img/bot.png',
            customerWelcomeText: 'Vui lòng nhập tên của bạn',
            customerButtonText: 'Bắt đầu'
        }
        if (configs.requestInfoSettings) {
            configs.styles.customerLogo = configs.requestInfoSettings.icon_robot
            configs.styles.customerWelcomeText = configs.requestInfoSettings.request_text
            configs.styles.customerWelcomePlaceholder = configs.requestInfoSettings.request_placeholder
            configs.styles.customerButtonText = configs.requestInfoSettings.submit_button
        }
    }
    customStyle = '&styles=' + encodeURIComponent(JSON.stringify(configs.styles))
    var customTheme = ''
    if (configs.themes) {
        customTheme = '&themes=' + encodeURIComponent(configs.themes)
    }

    /** Add extra info when start */
    var extraInfo = ''
    if (configs.extra_info) {
        extraInfo = '&extra_info=' + encodeURIComponent(JSON.stringify(configs.extra_info));
    }

    let useClientSenderInfo = '';
    let senderId = '';
    let senderToken = '';
    if (configs.useClientSenderInfo && configs.senderId && configs.senderToken) {
        useClientSenderInfo = '&use_client_sender_info=1';
        senderId = '&sender_id=' + configs.senderId;
        senderToken = '&sender_token=' + configs.senderToken;
    }
    let rejectIfAuthFailed = '';
    if (configs.rejectIfAuthFailed && configs.rejectIfAuthFailed === true) {
        rejectIfAuthFailed = '&reject_if_auth_failed=1';
    }

    let disableUploadFile = '';
    if (configs.disableUploadFile) {
        disableUploadFile = '&disable_upload_file=1'
    }

    let anomyousSender = '';
    if (configs.anomyousSender) {
        anomyousSender = '&anomyous_sender=1'
    }

    let clearSessionWhenRefresh = '';
    if (configs.autoClearSession) {
        clearSessionWhenRefresh = '&clear_session=1'
    }

    // for action react-button enable
    let reactButtonEnable = '';
    if (configs.reactButtonEnable) {
        reactButtonEnable = '&react_button_enable=1'
    }

    src_fpt_ai_ifr = baseUrl + '/index.html?botcode=' + encodeURIComponent(configs.appCode) +
        '&botname=' + encodeURIComponent(configs.appName) +
        '&sendername=' + encodeURIComponent(configs.senderName) +
        '&scendpoint=' + encodeURIComponent(socketUrl) +
        '&time=' + (new Date()).getTime().toString() + subChannel +
        extraInfo + disableUploadFile + useClientSenderInfo + senderId + senderToken +
        anomyousSender + customTheme + customStyle + clearSessionWhenRefresh +
        rejectIfAuthFailed + reactButtonEnable

    // update custom style
    let styleConfig = {
        headerText: 'Hỗ trợ trực tuyến',
        headerBackground: 'linear-gradient(86.7deg, #3353a2ff 0.85%, #31b7b7ff 98.94%)',
        headerTextColor: '#ffffffff',
        primaryColor: '#6d9ccbff',
        primaryTextColor: '#ffffffff',
        floatButtonLogo: baseUrl + '/img/Icon-fpt-ai.png',
        floatButtonTooltip: 'FPT.AI xin chào',
        floatButtonTooltipEnable: false
    }
    if (configs.styles) {
        for (let i in configs.styles) {
            styleConfig[i] = configs.styles[i]
        }
    }

    // float button
    const floatBtnTooltipId = 'fpt_ai_livechat_button_tooltip'
    let floatBtnTooltip = document.createElement('div')
    floatBtnTooltip.id = floatBtnTooltipId
    floatBtnTooltip.setAttribute('class', 'fpt_ai_livechat_button_tooltip')
    floatBtnTooltip.setAttribute('style', `color:${styleConfig.primaryTextColor}`)
    floatBtnTooltip.innerHTML = styleConfig.floatButtonTooltip
    document.body.appendChild(floatBtnTooltip)

    let floatBtn = document.createElement('button')
    floatBtn.id = chat_floating_button
    floatBtn.setAttribute('class', chat_floating_button + '_blink')
    floatBtn.setAttribute('style', `background:${styleConfig.primaryColor}`)
    floatBtn.addEventListener('click', fpt_ai_livechat_button_click)
    floatBtn.addEventListener('mouseover', function () {
        if (styleConfig.floatButtonTooltipEnable) {
            document.getElementById(floatBtnTooltipId).classList.add('active')
        }
    })
    floatBtn.addEventListener('mouseleave', function () {
        document.getElementById(floatBtnTooltipId).classList.remove('active')
    })
    let iconAi = document.createElement('img')
    iconAi.src = styleConfig.floatButtonLogo
    iconAi.alt = 'logobutton'
    floatBtn.appendChild(iconAi)
    document.body.appendChild(floatBtn)

    // live chat container
    let closeIcon = baseUrl + '/img/close.png'
    let fullScreenIcon = baseUrl + '/img/fullscreen.png'
    let livechatTemplate =
        `
        <div 
            id="fpt_ai_livechat_container_header" 
            style="background:${styleConfig.headerBackground};color:${styleConfig.headerTextColor}"
        >
            ${styleConfig.headerLogoEnable ? `<img src="${styleConfig.headerLogoLink}" style="margin-right: 5px">` : ''}
            <div class="fpt_ai_livechat_header_name">${styleConfig.headerText}</div>
            <div style="flex: 1 1 1px;"></div>
            <button id="fpt_ai_livechat_toggle_fullscreen" class="fpt_ai_livechat_container_header_fullscreen_button">
                <img src="${fullScreenIcon}" alt="full"/>
            </button>
            <button class="fpt_ai_livechat_container_header_close_button">
                <img src="${closeIcon}" alt="close"/>
            </button>
        </div>
        <div id='fpt_ai_livechat_container_iframe'></div>
        `
    let livechatContainer = document.createElement('div')
    livechatContainer.id = chat_container_id
    livechatContainer.innerHTML = livechatTemplate
    document.body.appendChild(livechatContainer)

    // bind event to button
    let elemHeaderBox = document.getElementById('fpt_ai_livechat_container_header')
    elemHeaderBox.addEventListener('click', fpt_ai_livechat_button_click)

    let fullscreenBtn = document.getElementById('fpt_ai_livechat_toggle_fullscreen')
    fullscreenBtn.addEventListener('click', function (event) {
        if (event) {
            event.stopPropagation()
        }
        let wrap = document.getElementById(livechatContainer.id)
        if (wrap.classList) {
            wrap.classList.toggle('fullscreen')
        } else {
            // For IE9 and lower
            var classes = wrap.className.split(' ')
            var i = classes.indexOf('fullscreen')
            if (i >= 0) {
                classes.splice(i, 1)
            } else {
                classes.push('fullscreen')
                wrap.className = classes.join(' ')
            }
        }
    })

    var fpt_ai_i_live_chat_ifrm = document.getElementById('fpt_ai_livechat_container_iframe')
    if (fpt_ai_i_live_chat_ifrm) {
        fpt_ai_i_live_chat_ifrm.innerHTML = '<iframe id="fpt_ai_i_live_chat" name="' + Date.now() + '" style="border: none; background-color: transparent; position: absolute; bottom: 0; right: 0; width: 100%; height: 100%;"></iframe>'

        // var fpt_ai_i_live_chat = document.getElementById('fpt_ai_i_live_chat')
        // fpt_ai_i_live_chat.src = src_fpt_ai_ifr
    }

}

function fpt_ai_livechat_button_click () {
    var ctnChatBox = document.getElementById(chat_container_id)
    if (document.getElementById(chat_container_id).style.display === 'block') {
        document.getElementById(chat_container_id).style.display = 'none'
    } else {
        var fpt_ai_i_live_chat = document.getElementById('fpt_ai_i_live_chat')
        if (!fpt_ai_box_chat_already_load) {
            fpt_ai_i_live_chat.src = src_fpt_ai_ifr
            fpt_ai_box_chat_already_load = true
        }
        document.getElementById(chat_container_id).style.display = 'block'
    }
    if (!ctnChatBox.hidden) {
        document.getElementById('fpt_ai_i_live_chat').contentWindow.postMessage('livechat_open_box_chat_click', '*')
    }
}
