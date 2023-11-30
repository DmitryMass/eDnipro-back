28.11.2023 (базове налаштування старту проекту 30хв)
29.11.2023 старт проекту (8:22)
30.11.2023 (17:27) - предварительно бек написан, возможны изменения по ходу написания фронта

Некоторые нюансы (за счет того что нужно максимально быстро разработать проект)

1. Опускаем описание опций валидации (используем стандартную по dto)
2. Ловим ошибки плюс логируем ошибки (Использую фильтра под контроллеры, не использую глобально)
3. Возможно некоторые статусы или доп инфo для Swagger документации так же могут быть пропущено (менее важные)
4. Привязка файла к таске или проекту (используем 1 файл, без массива файлов (Под файлом имеется ввиду Картинка по тз))
5. По тз нет информации по Фильтрам \ Сортировкам. По сортировке принято решение сделать сортировку по createdAt для проектов т.е. по дате создания проекта. Фильтра и пагинация как я понимаю относится к Задачам уже которые относятся к конкретному проекту. Фильтра будут всего 3 по тегам задачи (создана \ выполняется \ выполнено) тк не указано для чего нужны фильтра (для созадния универсального какого-либо варианта, нужно понимать все возможные поля для расширения фильтров). Пагинацию так же будет добавлено вместе с сортировкой и к Проектам для удобного управления. (возможно динамическую по клику кнопки(пока на рассмотрении))

   Сервер:

- (complete) Налаштуйте Nest.js/Express.js сервер та підключіть MongoDB.
- (80% complete) Реалізуйте CRUD операції для моделі Project.
- (in progress) Розробіть модель Task та реалізуйте CRUD операції.
- (complete) Додайте аутентифікацію та авторизацію за допомогою JWT.
- (complete) Додайте мідлвар для обробки помилок та логування. (в спешке много где в коде указал try catch , которые ловит ошибки перед глобальным фильтром, и передает туда имеенно ошибку из catch , а не словленную в try, обратил внимание уже слишком поздно чтобы переделывать все запросы, по этому оставлю комментарий тут, о том что есть такая ошибка)
- (complete) Реалізуйте роботу з файловою системою для завантаження та видалення зображень.
- (complete) Документуйте API за допомогою Swagger, включаючи моделі запитів та відповідей.
- (in progress) Оптимізуйте запити до бази даних для підвищення продуктивності та швидкодії.

Впервые попробуем подключить CDN для файлов. Посмотрим что из этого выйдет.
Для CDN используем Cloudinary

После 2 часов разработки, решил оставить скачивание файлов напрямую с клиента из Cloudinary CDN. (Пробовал делать редирект через запрос на сервер, но даже с установкой хедеров, при клике не удалось скачать файл, выдавало только json, возможно имея больше времени доразобрался бы). Почему хотел через сервер скачивание с редиректом, тк хотел сделать более безопасный способ (скачивания только если есть Токен валидный авторизованого пользователя). Остальные env скрыты.

На некоторых участках кода, которые могут показаться не понятными, были добавлекны комментарии, с обьяснениями

Додаткові вимоги:
Приділіть увагу декомпозиції коду на компоненти та модулі.
Використовуйте Git для версіонування коду та GitHub для представлення роботи.
