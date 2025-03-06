import requests
import threading


def worker(th: str):
    d = requests.get('http://127.0.0.1:9100/metrics')
    if "prom_metric_here" in d.text:
        print('Thread ' + th + ': success')
    else:
        print('Thread ' + th + ': smth wrong - exit code ' + str(d.status_code))


if __name__ == "__main__":
    workers = []

    for i in range(0, 100):
        th = threading.Thread(target=worker,args=(str(i),))
        workers.append(th)

    for w in workers:
        w.start()

    for w in workers:
        w.join()
