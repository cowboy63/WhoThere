from twilio.rest import Client
import cv2 as cv

ACCOUNT_SID = "ACcaf8419b453b1b2f1ac5c454afed14ee"
AUTH_TOKEN = "03e7ec4a20b52b0808875e52c12b563a"

client = Client(ACCOUNT_SID, AUTH_TOKEN)

#message = client.messages.create(from_="+18329374159", body="Hello", to="+18322606567")

cam = cv.VideoCapture(0)
classifier = cv.CascadeClassifier('C:\\Users\\travi\\venv\\Lib\\site-packages\\cv2\\data\\haarcascade_frontalface_alt.xml')
while True:
    ret, frame = cam.read()
    if ret:
        frame = cv.flip(frame, 1)
        gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        faces = classifier.detectMultiScale(gray)

        for x,y,w,h in faces:
            cv.imshow("face", frame[y - 40:y + h + 40, x - 40:x + w + 40])
            cv.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 1)
        cv.imshow("Image", frame)

        if cv.waitKey(1) & 0xFF == ord('q'):
            break
    else:
        break

cam.release()
cv.destroyAllWindows()