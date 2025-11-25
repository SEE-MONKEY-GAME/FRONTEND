class Event {
  emitCoin(coin: number) {
    window.dispatchEvent(new CustomEvent('game:coin', { detail: { coin } }));
  }

  emitScore(score: number) {
    window.dispatchEvent(new CustomEvent('game:score', { detail: { score } }));
  }

  emitFever(progress01: number, active: boolean, timeLeftMs = 0) {
    window.dispatchEvent(
      new CustomEvent('game:fever', {
        detail: { progress: progress01, active, timeLeftMs },
      }),
    );
  }

  emitGameOver(score: number, coin: number) {
    window.dispatchEvent(new CustomEvent('game:over', { detail: { score, coin } }));
  }
}

export default Event;
