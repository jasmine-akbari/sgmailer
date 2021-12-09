//EmailService.js
var fs = require('fs');
const sgMail = require('@sendgrid/mail')
const moment = require('moment');

// API REQUEST W API KEY
sgMail.setApiKey(process.env.NOTIFICATIONS_EMAIL_API_KEY)

var renderData = async function(data){

    let sendData = {};

    try{

        var template = "";
        template =  await getEmailTemplate(sails.config.globals.DEFAULT_NOTIFICATION_EMAIL_TEMPLATE_ID)
        let style = await getLogoAndBackgroundColorFromOrg()
        data = {...data,...style}
	    var keys = Object.keys(data);

	    for (i in keys) {
            var regex = new RegExp('#{' + keys[i] + '}', 'g');
	        template = template.replace(regex, data[keys[i]]);
        }

        // insert regex neccessary to remove any malformation of email notifications        
        template = template.replace('#{amesite_logo}', "");
        template = template.replace('#{comment}', "");
        template = template.replace('Dear #{first_name} #{last_name},', "");
        template = template.replace(' #{last_name}', "");
        template = template.replace('#{hotlink}', "");
        template = template.replace('#{logo_url}', "");
        template = template.replace('#{background_color}', "");


        var missingFirstNameRegex = new RegExp('Dear #{first_name}');

        if (template.match(missingFirstNameRegex)) {
            var fullLineRegex = new RegExp('Dear #{first_name} [A-Za-z]+,');
            template = template.replace(fullLineRegex, "");
        }
        if (_.includes([40], data.notify_scenario_id)) { //UnRegistered users invitation
            template = template.replace('Dear #{first_name} #{last_name},', "Hey there #{first_name} #{last_name},");

        }    
        sendData = {};
            sendData.html = template;
            sendData.from = data.from;
            sendData.to = data.to;
            sendData.replyTo = data.replyTo;
            sendData.subject = data.subject;            

            sails.log.info("@Service EmailService @Method renderData() @Message sendMail triggering for jobID===>",data.jobID);
            return await sgMail.send(sendData);
    }
    catch(err){
        sails.log.error("@Service EmailService @Method renderData() @Message Error::",err);
        //sails.log.error("@Service EmailService @Method renderData() @Message Throttling Error sendData::",sendData);
        sails.log.error("****************************************************************************************");

        return { Message:"Error while sending email using SendGrid" };
    }
}

var renderInstructorEmailRemainderTemplateData = async function(data){

    let sendData = {};

    try{


 
        let template =await getEmailTemplate(sails.config.globals.REMINDER_EMAIL_NOTIFICATION_EMAIL_TEMPLATE_ID)

        data.day_of_week_due = data.day_of_week_due; 
        data.date_due = data.date_due; 
        data.time_due = data.time_due; 

        data.course_name = data.course_name; 
        data.scheduled_time = data.scheduled_time; 
        data.baseUrl = data.baseUrl; 
        let style = await getLogoAndBackgroundColorFromOrg()
        data = {...data,...style}
	    var keys = Object.keys(data);

	    for (i in keys) {
            var regex = new RegExp('#{' + keys[i] + '}', 'g');
	        template = template.replace(regex, data[keys[i]]);
        }

        // insert regex neccessary to remove any malformation of email notifications        
        template = template.replace('#{amesite_logo}', "");
        template = template.replace('#{comment}', "");
        template = template.replace('Hey there Professor #{first_name} #{last_name},', "");
        template = template.replace(' #{last_name}', "");
        template = template.replace('#{hotlink}', "");
        template = template.replace('#{logo_url}', "");
        template = template.replace('#{background_color}', "");

        var missingFirstNameRegex = new RegExp('Hey there Professor #{first_name}');
        if (template.match(missingFirstNameRegex)) {
            var fullLineRegex = new RegExp('Hey there Professor #{first_name} [A-Za-z]+,');
            template = template.replace(fullLineRegex, "");
        }


        sendData = {};
        sendData.html = template;
        sendData.from = data.from;
        sendData.to = data.to;
        sendData.replyTo = data.replyTo;
        sendData.subject = data.subject;            
                
        // sails.log.info("123 -- sendData---------------------===>",sendData);
        sails.log.info("@Service EmailService @Method renderInstructorEmailRemainderTemplateData() @Message sendMail triggering for jobID===>",data.jobID);
        return await sgMail.send(sendData);
    }
    catch(err){
        sails.log.error("@Service EmailService @Method renderInstructorEmailRemainderTemplateData() @Message data::", data);
        sails.log.error("@Service EmailService @Method renderInstructorEmailRemainderTemplateData() @Message Error::", err);
        //sails.log.error("@Service EmailService @Method renderInstructorEmailRemainderTemplateData() @Message Throttling Error sendData::",sendData);
        sails.log.error("****************************************************************************************");

        return { Message:"Error while sending email using SendGrid" };
    }
}

var renderEmailRemainderTemplateData = async function(data){

        let sendData = {};

        try{
            var template =await getEmailTemplate(sails.config.globals.EMAIL_NOTIFICATION_EMAIL_TEMPLATE_ID)
            //get data
            data.num_assign_due = data.data.length;      
            let item = data.data[0];
            data.is_plural = (data.num_assign_due > 1) ? "s" : "";
            data.day_of_week_due = moment(item.end_date).format('dddd')
            data.date_due = moment(item.end_date).format("MM/DD/YY");
            data.time_due = moment(item.end_date).format("hh:mm a");
            data.course_name = item.course_name; 
            //get Week
            var start_date_of_current_week = moment(item.activity_start_date).startOf('isoWeek').toDate();
            var week = moment(start_date_of_current_week).diff(moment(moment(item.course_start_date).startOf('isoWeek').toDate()), 'weeks');
            if (week >= 0) {
                week = week + 1;
            }
            let style = await getLogoAndBackgroundColorFromOrg()
            data = {...data,...style}

            var keys = Object.keys(data);
            for (i in keys) {
                var regex = new RegExp('#{' + keys[i] + '}', 'g');
                template = template.replace(regex, data[keys[i]]);
            }

            var engagement_template = "";

            var quiz_template = "";
            var exam_template = "";
            var survey_template = "";

            var homework_template = "";
            var project_template = "";
            var extra_credit_template = "";
            var group_activity_template = "";

            var writing_assignment_template = "";
            if(data.course_organise){
                data.course_organise = data.course_organise == "weeks" ? "Week" : "Unit"
            }else{
                data.course_organise = "Week"
            }
            for(const casObj of data.data){

                casObj.course_organise = data.course_organise;
                if(casObj.course_organise == "Week"){
                    casObj.weekOrUnit = casObj.week_name;
                }else if(casObj.course_organise == "Unit"){
                    if(casObj.unit_name){
                        casObj.weekOrUnit = casObj.unit_name;
                    }else{
                        casObj.weekOrUnit = "Unit " + casObj.unit_id;
                    }

                }
                //get hotlink
                let hotlink = await SupportService.getHotLink(casObj);

                //Engagement
                if(casObj.course_activity_type_id == 14){
                    // sails.log("casObj casObj --->", casObj);
                    if(casObj.total_post == 0){
                        //engagement_case_1
                        engagement_template =await getEmailTemplate(sails.config.globals.ENGAGEMENT_TEMPLATE_CASE_1_ID)
                    }else{
                        //engagement_case_2
                        engagement_template =await getEmailTemplate(sails.config.globals.ENGAGEMENT_TEMPLATE_CASE_2_ID)      
                    }
                    let engagement_template_data = {"week_num": casObj.weekOrUnit}
                    let keys = Object.keys(engagement_template_data);
                    for (i in keys) {
                        let regex = new RegExp('#{' + keys[i] + '}', 'g');
                        engagement_template = engagement_template.replace(regex, engagement_template_data[keys[i]]);
                    } 
                }
                //Quiz
                if(casObj.course_activity_type_id == 9){
                    quiz_template += await get_template_for_2_9(casObj, week, hotlink);
                }
                // Survey Template
                if(casObj.course_activity_type_id == 24){
                    survey_template += await get_template_for_2_9(casObj, week, hotlink);
                }

                 // Survey Template
                 if(casObj.course_activity_type_id == 23){
                    group_activity_template += await get_template_for_2_9(casObj, week, hotlink);
                }
                //Exam
                if(casObj.course_activity_type_id == 2){
                    exam_template +=  await get_template_for_2_9(casObj, week, hotlink);
                }
                //Homework
                if (casObj.course_activity_type_id == 5){
                    homework_template += await get_template_for_1_5_15(casObj, week, hotlink);
                }
                //Project
                if (casObj.course_activity_type_id == 1){
                    project_template += await get_template_for_1_5_15(casObj, week, hotlink);
                }
                //Extra Credit
                if (casObj.course_activity_type_id == 15){
                    extra_credit_template += await get_template_for_1_5_15(casObj, week, hotlink);
                }
                //Assignment
                if (casObj.course_activity_type_id == 13){

                    writing_assignment_template =await getEmailTemplate(sails.config.globals.WRITING_ASSIGNMENT_TEMPLATE_CASE_1_ID)      

                    let writing_assignment_template_data = {
                        "Writing_assignment_title": casObj.assessment_title,
                        "week_num": casObj.weekOrUnit,
                        "writing_assignment_number": casObj.assessment_no,
                        "writing_assignment_link": hotlink,
                        "code": casObj.code,
                    };
                    let keys = Object.keys(writing_assignment_template_data);
                    for (i in keys) {
                        let regex = new RegExp('#{' + keys[i] + '}', 'g');
                        writing_assignment_template = writing_assignment_template.replace(regex, writing_assignment_template_data[keys[i]]);
                    }
                }
            };
       
            template = template.replace('#{engagement_template}', engagement_template);
            template = template.replace('#{quiz_template}', quiz_template);
            template = template.replace('#{exam_template}', exam_template);
            template = template.replace('#{homework_template}', homework_template);
            template = template.replace('#{project_template}', project_template);
            template = template.replace('#{extra_credit_template}', extra_credit_template);
            template = template.replace('#{writing_assignment_template}', writing_assignment_template);
            template = template.replace('#{survey_template}', survey_template);
            template = template.replace('#{group_activity_template}', group_activity_template);

            var missingFirstNameRegex = new RegExp('Dear #{first_name}');
            if (template.match(missingFirstNameRegex)) {
                var fullLineRegex = new RegExp('Dear #{first_name} [A-Za-z]+,');
                template = template.replace(fullLineRegex, "");
            }

            sendData = {};
            sendData.html = template;
            sendData.from = data.from;
            sendData.to = data.to;
            sendData.replyTo = data.replyTo;
            sendData.subject = data.subject;            
                    
            // sails.log.info("123 -- sendData---------------------===>",sendData);
            sails.log.info("@Service EmailService @Method renderEmailRemainderTemplateData() @Message sendMail triggering for jobID===>",data.jobID);
            return await sgMail.send(sendData);
        }
        catch(err){
            sails.log.error("@Service EmailService @Method renderEmailRemainderTemplateData() @Message data::", data);
            sails.log.error("@Service EmailService @Method renderEmailRemainderTemplateData() @Message Error::", err);
            //sails.log.error("@Service EmailService @Method renderEmailRemainderTemplateData() @Message Throttling Error sendData::",sendData);
            sails.log.error("****************************************************************************************");

            return { Message:"Error while sending email using SendGrid" };
        }
    }

    async function get_template_for_1_5_15(casObj, week, hotlink) {
        var practice_template = "";
        var course_conten_template = "";
        var practice_link = "";
        var course_conten_link = "";

        for (const cc_p of casObj.cc_practice) {
            if(cc_p.course_activity_type_id == 4){
                if(practice_template == ""){
                    practice_template = "<p>For your convenience, a direct link to "+cc_p.assessment_title+", which will help you prepare for "+casObj.assessment_title+" is here:</p>"
                }else{
                    practice_template = "<p>For your convenience, a direct link to practices, which will help you prepare for "+casObj.assessment_title+" are here:</p>"
                }
                practice_link += "<p>"+  await SupportService.getHotLink(cc_p) +"</p>";
            }else if (_.includes([6,7,8], cc_p.course_activity_type_id)) {
                if(course_conten_template == ""){
                    course_conten_template += "<p>Links to course material that relate to "+casObj.assessment_title+" are here:</p>"
                }
                course_conten_link += "<p>"+  await SupportService.getHotLink(cc_p) +"</p>";
            }
        }
        var homework_template =await getEmailTemplate(sails.config.globals.HOMEWORK_TEMPLATE_CASE_1_ID)      
    
        let homework_template_data = {
            "Homework_title": casObj.assessment_title,
            "homework_title": casObj.assessment_title,
            "week_num": casObj.weekOrUnit,
            "hw_number": casObj.assessment_no,
            "week_practice": casObj.assessment_title,
            "practice_template": practice_template + practice_link,
            "course_conten_template": course_conten_template + course_conten_link,
            "homework_link": hotlink,
            "code": casObj.code,
        };

        let keys = Object.keys(homework_template_data);
        for (i in keys) {
            let regex = new RegExp('#{' + keys[i] + '}', 'g');
            homework_template = homework_template.replace(regex, homework_template_data[keys[i]]);
        }
        
        return homework_template;
    }

    async function get_template_for_2_9(casObj, week, hotlink) {
        let quiz_template =await getEmailTemplate(sails.config.globals.QUIZ_TEMPLATE_CASE_1_ID)      

        let quiz_template_data = {
            "quiz_title": casObj.assessment_title,
            "week_number": casObj.weekOrUnit,
            "quiz_number": casObj.assessment_no,
            "quiz_link": hotlink,
            "code": casObj.code,
        };

        let keys = Object.keys(quiz_template_data);
        for (i in keys) {
            let regex = new RegExp('#{' + keys[i] + '}', 'g');
            quiz_template = quiz_template.replace(regex, quiz_template_data[keys[i]]);
        }

        return quiz_template;
    }

    var renderInviteData = async function (input) {

        let sendData = {};
        let ical = require('ical-generator');
        let cal = ical();
        let contact_us_email = sails.config.globals.CONTACT_US_EMAIL;
    
        try {
            //TODO : Loading the Email template from local directory.
            //Yet to modify the template should load from database table.
            template = fs.readFileSync(sails.config.globals.DEFAULT_NOTIFICATION_EMAIL_INVITE_TEMPLATE, 'utf8');
       
            template = template.replace('#{web_link}', "Click here to join by web <a href="+process.env.PLATFORM_BASE_URL+">Click</a>");
            template = template.replace('#{dial_in_info}', "Join by phone " + 	input.confrence_number + " (PIN: " + input.dialin_pin + ")");

            cal.events([
                {
                    start: input.start_date,
                    end: input.end_date,
                    summary: input.title,
                    organizer: {
                        name: 'Amesite',
                        email: contact_us_email,
                    },
                    method: 'request',
                }
            ]);
    
            sails.log.info("@Service EmailService @Method renderData() @Message sendMail triggering for cal.toString()===>", cal.toString());
    
    
            await sgMail.send({
                from: input.from,
                to: input.to,
                subject: input.title,
                html: template,
                alternatives: [{
                  contentType: "text/calendar",
                  content: new Buffer(cal.toString())
                }]
                }, function(err, responseStatus) {
                if (err) {
                    console.log(err);
                    return err
                } else {
                    console.log(responseStatus.message);
                    return {message: "Invite sent successfully"}
                }
            });
        }
        catch (err) {
            sails.log.error("@Service EmailService @Method renderData() @Message Error::", err);
            //sails.log.error("@Service EmailService @Method renderData() @Message Throttling Error sendData::",sendData);
            sails.log.error("****************************************************************************************");
    
            return { Message: "Error while sending email using SendGrid" };
        }
    }
    async function getEmailTemplate(id) {
        let template =await EmailTemplate.get({id:id})
        return template.html_content
    }

    async function getLogoAndBackgroundColorFromOrg() {
        let orgRes = await Auth0Service.getOrganizationDetails(process.env.AUTH0_ORGANIZATIONID);
        return {logo_url: orgRes.branding.logo_url,background_color:orgRes.branding.colors.primary}
    }

module.exports = {
    send: async function(data){
        sails.log("@Srvice EmailService @Method Send data ---------------------===>", data);
        sails.log("@Srvice EmailService @Method Send data.notify_scenario_id ---------------------===>", data.notify_scenario_id);

        if(data.notify_scenario_id == 2){
		    return await renderEmailRemainderTemplateData(data);
        }else if(data.notify_scenario_id == 41){
            return await renderInstructorEmailRemainderTemplateData(data);
        }else{
            return await renderData(data);
        }
    },
    sendInvite: async function (data) {
        return await renderInviteData(data);
    },
}


