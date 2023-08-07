### goit-nodejs-REST-API-hw-06

Продовж створення REST API для роботи з колекцією контактів. Додайте верифікацію email користувача після реєстрації за допомогою сервісу SendGrid.

## Як процес верифікації повинен працювати
1. Після реєстрації, користувач повинен отримати лист на вказану при реєстрації пошту з посиланням для верифікації свого email
2. Пройшовши посиланням в отриманому листі, в перший раз, користувач повинен отримати Відповідь зі статусом 200, що буде мати на увазі успішну верифікацію email
3. Пройшовши по посиланню повторно користувач повинен отримати Помилку зі статусом 404

## Крок 1
### Підготовка інтеграції з SendGrid API

Зареєструйся на SendGrid.
Створи email-відправника. Для це в адміністративній панелі SendGrid зайдіть в меню Marketing в підміню senders і в правому верхньому куті натисніть кнопку "Create New Sender". Заповніть поля в запропонованій формі. Збережіть. Повинен вийде наступний як на картинці результат, тільки з вашим email:
[https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/img/06/sender-not-verify.png]

На вказаний email повинно прийти лист верифікації (перевірте спам якщо не бачите листи). Натисніть на посилання в ньому і завершите процес. Результат повинен зміниться на:
[https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/img/06/sender-verify.png]

Cтвори API токен доступу. Вибираємо меню "Email API", і підміню "Integration Guide". Тут вибираємо "Web API".
[https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/img/06/web-api.png]

Вибери технологію Node.js
[https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/img/06/node.png]

На третьому кроці додай ім'я нашого токені. Наприклад systemcats, натисни кнопку згенерувати і отримай результат як на скріншоті нижче. Скопіюй цей токен (це важливо, тому що більше ви не зможете його подивитися). Після заверш процес створення токена
[https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/img/06/api-key.png]

Отриманий API-токен додай в .env файл проекту

## Крок 2
### Створення ендпоінта для верифікації email

Додай в модель User два поля verificationToken і verify. Значення поля verify рівне false означатиме, що його email ще не пройшов верифікацію

{
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
}

створи ендпоінт GET [/users/verify/:verificationToken](# verification-request), де по параметру verificationToken ми будемо шукати користувача в моделі User
якщо користувач з таким токеном не знайдений, необхідно повернути Помилку 'Not Found'
якщо користувач знайдений - встановлюємо verificationToken в null, а поле verify ставимо рівним true в документі користувача і повертаємо Успішну відповідь.

### Verification request
GET /auth/verify/:verificationToken

### Verification user Not Found
Status: 404 Not Found
ResponseBody: {
  message: 'User not found'
}

### Verification success response
Status: 200 OK
ResponseBody: {
  message: 'Verification successful',
}

## Крок 3
### Додавання відправки email користувачу з посиланням для верифікації

При створення користувача при реєстрації:

створити verificationToken для користувача і записати його в БД (для генерації токена використовуйте пакет uuid або nanoid)
відправити email на пошту користувача і вказати посилання для верифікації email'а ( /users/verify/:verificationToken) в повідомленні
Так само необхідно враховувати, що тепер логін користувача не дозволено, якщо не верифікувано email

## Крок 4
### Додавання повторної відправки email користувачу з посиланням для верифікації

Необхідно передбачити, варіант, що користувач може випадково видалити лист. Воно може не дійти з якоїсь причини до адресата. Наш сервіс відправки листів під час реєстрації видав помилку і т.д.

### @ POST /users/verify
Отримує body в форматі {email}
Якщо в body немає обов'язкового поля email, повертає json з ключем {"message":"missing required field email"} і статусом 400
Якщо з body все добре, виконуємо повторну відправку листа з verificationToken на вказаний email, але тільки якщо користувач не верифікований
Якщо користувач вже пройшов верифікацію відправити json з ключем {"message":"Verification has already been passed"} зі статусом 400 Bad Request

#### Resending a email request
POST /users/verify
Content-Type: application/json
RequestBody: {
  "email": "example@example.com"
}

#### Resending a email validation error
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Помилка від Joi або іншої бібліотеки валідації>

#### Resending a email success response
Status: 200 Ok
Content-Type: application/json
ResponseBody: {
  "message": "Verification email sent"
}

#### Resend email for verified user
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  message: "Verification has already been passed"
}

#### ПРИМІТКА
Як альтернативу SendGrid можна використовувати пакет nodemailer

### Додаткове завдання - необов'язкове
1. Напишіть dockerfile для вашої програми
