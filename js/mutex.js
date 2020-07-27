import _Error from 'isotropic-error';
import _later from 'isotropic-later';
import _make from 'isotropic-make';

const _noop = () => {
    // Do nothing
};

export default _make({
    exclusive ({
        resource,
        timeout = null
    }) {
        let cancel;

        const promise = new Promise((resolve, reject) => {
            let lock = this._lockByResourceMap.get(resource),
                timer;

            if (!lock) {
                lock = this._createLock();
                this._lockByResourceMap.set(resource, lock);
            }

            const id = Symbol('exclusiveLockId'),
                unlock = () => {
                    if (lock.exclusiveLockId === id) {
                        lock.exclusiveLockId = null;
                        this._update({
                            lock,
                            resource
                        });
                    }
                };

            if (lock.exclusiveLockId || lock.sharedLockIdSet.size || lock.upgradableLockId) {
                const exclusiveLock = () => {
                    if (timer) {
                        timer.cancel();
                        timer = null;
                    }

                    lock.exclusiveLockId = id;

                    resolve({
                        mode: 'exclusive',
                        unlock
                    });
                };

                cancel = () => {
                    const index = lock.exclusiveLockQueue.indexOf(exclusiveLock);

                    if (index === -1) {
                        return;
                    }

                    lock.exclusiveLockQueue.splice(index, 1);

                    if (timer) {
                        timer.cancel();
                        timer = null;
                    }

                    reject(_Error({
                        message: 'Lock cancelled'
                    }));

                    this._update({
                        lock,
                        resource
                    });
                };

                lock.exclusiveLockQueue.push(exclusiveLock);

                if (timeout) {
                    timer = _later(timeout, cancel);
                }
            } else {
                cancel = _noop;

                lock.exclusiveLockId = id;

                resolve({
                    mode: 'exclusive',
                    unlock
                });
            }
        });

        promise.cancel = cancel;
        promise.mode = 'exclusive';

        return promise;
    },
    shared ({
        resource,
        timeout = null
    }) {
        let cancel;

        const promise = new Promise((resolve, reject) => {
            let lock = this._lockByResourceMap.get(resource),
                timer;

            if (!lock) {
                lock = this._createLock();
                this._lockByResourceMap.set(resource, lock);
            }

            const id = Symbol('sharedLockId'),
                unlock = () => {
                    if (lock.sharedLockIdSet.has(id)) {
                        lock.sharedLockIdSet.delete(id);
                        this._update({
                            lock,
                            resource
                        });
                    }
                };

            if (lock.exclusiveLockId || lock.exclusiveLockQueue.length || lock.upgradeCallbackFunction) {
                const sharedLock = () => {
                    if (timer) {
                        timer.cancel();
                        timer = null;
                    }

                    lock.sharedLockIdSet.add(id);

                    resolve({
                        mode: 'shared',
                        unlock
                    });
                };

                cancel = () => {
                    const index = lock.sharedLockQueue.indexOf(sharedLock);

                    if (index === -1) {
                        return;
                    }

                    lock.sharedLockQueue.splice(index, 1);

                    if (timer) {
                        timer.cancel();
                        timer = null;
                    }

                    reject(_Error({
                        message: 'Lock cancelled'
                    }));

                    this._update({
                        lock,
                        resource
                    });
                };

                lock.sharedLockQueue.push(sharedLock);

                if (timeout) {
                    timer = _later(timeout, cancel);
                }
            } else {
                cancel = _noop;

                lock.sharedLockIdSet.add(id);

                resolve({
                    mode: 'shared',
                    unlock
                });
            }
        });

        promise.cancel = cancel;
        promise.mode = 'shared';

        return promise;
    },
    upgradable ({
        resource,
        timeout = null
    }) {
        let cancel;

        const promise = new Promise((resolve, reject) => {
            let lock = this._lockByResourceMap.get(resource),
                timer;

            if (!lock) {
                lock = this._createLock();
                this._lockByResourceMap.set(resource, lock);
            }

            const id = Symbol('upgradableLockId'),
                unlock = () => {
                    if (lock.upgradableLockId === id) {
                        if (lock.exclusiveLockId === id) {
                            lock.exclusiveLockId = null;
                        }

                        lock.upgradableLockId = null;
                        lock.upgradeCallbackFunction = null;

                        this._update({
                            lock,
                            resource
                        });
                    }
                },
                upgrade = ({
                    timeout = null
                } = {}) => {
                    let cancel;

                    const promise = new Promise((resolve, reject) => {
                        if (lock.upgradableLockId !== id) {
                            reject(_Error({
                                message: 'Already unlocked'
                            }));

                            return;
                        }

                        if (lock.exclusiveLockId === id) {
                            reject(_Error({
                                message: 'Already upgraded'
                            }));

                            return;
                        }

                        if (lock.upgradeCallbackFunction) {
                            reject(_Error({
                                message: 'Upgrade already requested'
                            }));

                            return;
                        }

                        let timer;

                        const downgrade = () => {
                            if (lock.exclusiveLockId === id) {
                                lock.exclusiveLockId = null;
                                this._update({
                                    lock,
                                    resource
                                });
                            }
                        };

                        if (lock.sharedLockIdSet.size) {
                            const upgradeCallbackFunction = () => {
                                lock.upgradeCallbackFunction = null;

                                if (timer) {
                                    timer.cancel();
                                    timer = null;
                                }

                                lock.exclusiveLockId = id;

                                resolve({
                                    downgrade,
                                    mode: 'upgraded'
                                });
                            };

                            cancel = () => {
                                if (lock.upgradeCallbackFunction !== upgradeCallbackFunction) {
                                    return;
                                }

                                lock.upgradeCallbackFunction = null;

                                if (timer) {
                                    timer.cancel();
                                    timer = null;
                                }

                                reject(_Error({
                                    message: 'Upgrade cancelled'
                                }));

                                this._update({
                                    lock,
                                    resource
                                });
                            };

                            lock.upgradeCallbackFunction = upgradeCallbackFunction;

                            if (timeout) {
                                timer = _later(timeout, cancel);
                            }
                        } else {
                            cancel = _noop;

                            lock.exclusiveLockId = id;

                            resolve({
                                downgrade,
                                mode: 'upgraded'
                            });
                        }
                    });

                    promise.cancel = cancel;
                    promise.mode = 'upgraded';

                    return promise;
                };

            if (lock.exclusiveLockId || lock.exclusiveLockQueue.length || lock.upgradableLockId) {
                const upgradableLock = () => {
                    if (timer) {
                        timer.cancel();
                        timer = null;
                    }

                    lock.upgradableLockId = id;

                    resolve({
                        mode: 'upgradable',
                        unlock,
                        upgrade
                    });
                };

                cancel = () => {
                    const index = lock.upgradableLockQueue.indexOf(upgradableLock);

                    if (index === -1) {
                        return;
                    }

                    lock.upgradableLockQueue.splice(index, 1);

                    if (timer) {
                        timer.cancel();
                        timer = null;
                    }

                    reject(_Error({
                        message: 'Lock cancelled'
                    }));

                    this._update({
                        lock,
                        resource
                    });
                };

                lock.upgradableLockQueue.push(upgradableLock);

                if (timeout) {
                    timer = _later(timeout, cancel);
                }
            } else {
                cancel = _noop;

                lock.upgradableLockId = id;

                resolve({
                    mode: 'upgradable',
                    unlock,
                    upgrade
                });
            }
        });

        promise.cancel = cancel;
        promise.mode = 'upgradable';

        return promise;
    },
    _createLock () {
        return {
            exclusiveLockId: null,
            exclusiveLockQueue: [],
            sharedLockIdSet: new Set(),
            sharedLockQueue: [],
            upgradableLockId: null,
            upgradableLockQueue: [],
            upgradeCallbackFunction: null
        };
    },
    _init () {
        this._lockByResourceMap = new Map();

        return this;
    },
    _update ({
        lock,
        resource
    }) {
        if (lock.exclusiveLockId) {
            return;
        }

        if (!lock.sharedLockIdSet.size) {
            if (lock.upgradableLockId) {
                if (lock.upgradeCallbackFunction) {
                    lock.upgradeCallbackFunction();
                    return;
                }
            } else if (lock.exclusiveLockQueue.length) {
                lock.exclusiveLockQueue.shift()();
                return;
            }
        }

        if (lock.exclusiveLockQueue.length) {
            return;
        }

        while (lock.sharedLockQueue.length) {
            lock.sharedLockQueue.shift()();
        }

        if (lock.upgradableLockId) {
            return;
        }

        if (lock.upgradableLockQueue.length) {
            lock.upgradableLockQueue.shift()();
            return;
        }

        if (!lock.sharedLockIdSet.size && !lock.upgradableLockQueue.length) {
            this._lockByResourceMap.delete(resource);
        }
    }
}, {
    _init () {
        const staticInstance = this();

        this.exclusive = staticInstance.exclusive.bind(staticInstance);
        this.shared = staticInstance.shared.bind(staticInstance);
        this.upgradable = staticInstance.upgradable.bind(staticInstance);

        return this;
    }
});
