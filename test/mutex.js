import _chai from 'isotropic-dev-dependencies/lib/chai.js';
import _Error from 'isotropic-error';
import _later from 'isotropic-later';
import _mocha from 'isotropic-dev-dependencies/lib/mocha.js';
import _Mutex from '../js/mutex.js';

_mocha.describe('mutex', function () {
    this.timeout(987);

    _mocha.it('should allow exclusive access to a resource', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`I: Obtain ${mode} lock on 'resource'`);

                log.push('J: Unlock \'resource\'');
                unlock();
            });

            log.push('E: Unlock \'resource\'');
            unlock();
        });

        log.push('B: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`F: Obtain ${mode} lock on 'resource'`);

            log.push('G: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`K: Obtain ${mode} lock on 'resource'`);

                log.push('L: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request exclusive lock on \'resource\'',
                    'B: Request exclusive lock on \'resource\'',
                    'C: Obtain exclusive lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Unlock \'resource\'',
                    'F: Obtain exclusive lock on \'resource\'',
                    'G: Request exclusive lock on \'resource\'',
                    'H: Unlock \'resource\'',
                    'I: Obtain exclusive lock on \'resource\'',
                    'J: Unlock \'resource\'',
                    'K: Obtain exclusive lock on \'resource\'',
                    'L: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            log.push('H: Unlock \'resource\'');
            unlock();
        });
    });

    _mocha.it('should allow shared access to a resource', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);
            });
        });

        log.push('B: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`E: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('F: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                _chai.expect(unlocks.length).to.equal(4);

                unlocks.forEach(unlock => {
                    unlock();
                });

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Request shared lock on \'resource\'',
                    'C: Obtain shared lock on \'resource\'',
                    'D: Request shared lock on \'resource\'',
                    'E: Obtain shared lock on \'resource\'',
                    'F: Request shared lock on \'resource\'',
                    'G: Obtain shared lock on \'resource\'',
                    'H: Obtain shared lock on \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should allow upgradable access to a resource', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);

            log.push('D: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`I: Obtain ${mode} lock on 'resource'`);

                log.push('J: Unlock \'resource\'');
                unlock();
            });

            log.push('E: Unlock \'resource\'');
            unlock();
        });

        log.push('B: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`F: Obtain ${mode} lock on 'resource'`);

            log.push('G: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`K: Obtain ${mode} lock on 'resource'`);

                log.push('L: Request upgraded lock on \'resource\'');
                upgrade().then(({
                    downgrade,
                    mode
                }) => {
                    log.push(`M: Obtain ${mode} lock on 'resource'`);

                    log.push('N: Downgrade lock on \'resource\'');
                    downgrade();

                    log.push('O: Unlock \'resource\'');
                    unlock();

                    _chai.expect(log).to.deep.equal([
                        'A: Request upgradable lock on \'resource\'',
                        'B: Request upgradable lock on \'resource\'',
                        'C: Obtain upgradable lock on \'resource\'',
                        'D: Request upgradable lock on \'resource\'',
                        'E: Unlock \'resource\'',
                        'F: Obtain upgradable lock on \'resource\'',
                        'G: Request upgradable lock on \'resource\'',
                        'H: Unlock \'resource\'',
                        'I: Obtain upgradable lock on \'resource\'',
                        'J: Unlock \'resource\'',
                        'K: Obtain upgradable lock on \'resource\'',
                        'L: Request upgraded lock on \'resource\'',
                        'M: Obtain upgraded lock on \'resource\'',
                        'N: Downgrade lock on \'resource\'',
                        'O: Unlock \'resource\''
                    ]);

                    callbackFunction();
                });
            });

            log.push('H: Unlock \'resource\'');
            unlock();
        });
    });

    _mocha.it('should not allow shared access to a resource while exclusive access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);

            log.push('D: Unlock \'resource\'');
            unlock();
        });

        log.push('B: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`E: Obtain ${mode} lock on 'resource'`);

            log.push('F: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request exclusive lock on \'resource\'',
                'B: Request shared lock on \'resource\'',
                'C: Obtain exclusive lock on \'resource\'',
                'D: Unlock \'resource\'',
                'E: Obtain shared lock on \'resource\'',
                'F: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should not allow upgradable access to a resource while exclusive access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);

            log.push('D: Unlock \'resource\'');
            unlock();
        });

        log.push('B: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`E: Obtain ${mode} lock on 'resource'`);

            log.push('F: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request exclusive lock on \'resource\'',
                'B: Request upgradable lock on \'resource\'',
                'C: Obtain exclusive lock on \'resource\'',
                'D: Unlock \'resource\'',
                'E: Obtain upgradable lock on \'resource\'',
                'F: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should not allow exclusive access to a resource while shared access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);

            log.push('D: Unlock \'resource\'');
            unlock();
        });

        log.push('B: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`E: Obtain ${mode} lock on 'resource'`);

            log.push('F: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request shared lock on \'resource\'',
                'B: Request exclusive lock on \'resource\'',
                'C: Obtain shared lock on \'resource\'',
                'D: Unlock \'resource\'',
                'E: Obtain exclusive lock on \'resource\'',
                'F: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should allow upgradable access to a resource while shared access has been granted', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);
        });

        log.push('B: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`D: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            _chai.expect(unlocks.length).to.equal(2);

            unlocks.forEach(unlock => {
                unlock();
            });

            _chai.expect(log).to.deep.equal([
                'A: Request shared lock on \'resource\'',
                'B: Request upgradable lock on \'resource\'',
                'C: Obtain shared lock on \'resource\'',
                'D: Obtain upgradable lock on \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should not allow upgraded access to a resource while shared access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);

                log.push('E: Request upgraded lock on \'resource\'');
                upgrade().then(({
                    mode
                }) => {
                    log.push(`G: Obtain ${mode} lock on 'resource'`);

                    log.push('H: Unlock \'resource\'');
                    unlock();

                    _chai.expect(log).to.deep.equal([
                        'A: Request shared lock on \'resource\'',
                        'B: Obtain shared lock on \'resource\'',
                        'C: Request upgradable lock on \'resource\'',
                        'D: Obtain upgradable lock on \'resource\'',
                        'E: Request upgraded lock on \'resource\'',
                        'F: Unlock \'resource\'',
                        'G: Obtain upgraded lock on \'resource\'',
                        'H: Unlock \'resource\''
                    ]);

                    callbackFunction();
                });
            });

            _later(55, () => {
                log.push('F: Unlock \'resource\'');
                unlock();
            });
        });
    });

    _mocha.it('should not allow exclusive access to a resource while upgradable access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);

            log.push('D: Unlock \'resource\'');
            unlock();
        });

        log.push('B: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`E: Obtain ${mode} lock on 'resource'`);

            log.push('F: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request upgradable lock on \'resource\'',
                'B: Request exclusive lock on \'resource\'',
                'C: Obtain upgradable lock on \'resource\'',
                'D: Unlock \'resource\'',
                'E: Obtain exclusive lock on \'resource\'',
                'F: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should allow shared access to a resource while upgradable access has been granted', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);
        });

        log.push('B: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`D: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            _chai.expect(unlocks.length).to.equal(2);

            unlocks.forEach(unlock => {
                unlock();
            });

            _chai.expect(log).to.deep.equal([
                'A: Request upgradable lock on \'resource\'',
                'B: Request shared lock on \'resource\'',
                'C: Obtain upgradable lock on \'resource\'',
                'D: Obtain shared lock on \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should not allow shared access to a resource while upgraded access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgraded lock on \'resource\'');
            upgrade().then(({
                mode
            }) => {
                log.push(`E: Obtain ${mode} lock on 'resource'`);

                log.push('F: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);

                log.push('H: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request upgradable lock on \'resource\'',
                    'B: Obtain upgradable lock on \'resource\'',
                    'C: Request upgraded lock on \'resource\'',
                    'D: Request shared lock on \'resource\'',
                    'E: Obtain upgraded lock on \'resource\'',
                    'F: Unlock \'resource\'',
                    'G: Obtain shared lock on \'resource\'',
                    'H: Unlock \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should not allow shared access to a resource while exclusive access has been requested', callbackFunction => {
        const log = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`F: Obtain ${mode} lock on 'resource'`);

                log.push('G: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);

                log.push('I: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Obtain shared lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request shared lock on \'resource\'',
                    'E: Unlock \'resource\'',
                    'F: Obtain exclusive lock on \'resource\'',
                    'G: Unlock \'resource\'',
                    'H: Obtain shared lock on \'resource\'',
                    'I: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            _later(55, () => {
                log.push('E: Unlock \'resource\'');
                unlock();
            });
        });
    });

    _mocha.it('should not allow upgradable access to a resource while exclusive access has been requested', callbackFunction => {
        const log = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`F: Obtain ${mode} lock on 'resource'`);

                log.push('G: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);

                log.push('I: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Obtain shared lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request upgradable lock on \'resource\'',
                    'E: Unlock \'resource\'',
                    'F: Obtain exclusive lock on \'resource\'',
                    'G: Unlock \'resource\'',
                    'H: Obtain upgradable lock on \'resource\'',
                    'I: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            _later(55, () => {
                log.push('E: Unlock \'resource\'');
                unlock();
            });
        });
    });

    _mocha.it('should not allow shared access to a resource while upgraded access has been requested', callbackFunction => {
        const log = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);

                log.push('E: Request upgraded lock on \'resource\'');
                upgrade().then(({
                    mode
                }) => {
                    log.push(`H: Obtain ${mode} lock on 'resource'`);

                    log.push('I: Unlock \'resource\'');
                    unlock();
                });

                log.push('F: Request shared lock on \'resource\'');
                _Mutex.shared({
                    resource: 'resource'
                }).then(({
                    mode,
                    unlock
                }) => {
                    log.push(`J: Obtain ${mode} lock on 'resource'`);

                    log.push('K: Unlock \'resource\'');
                    unlock();

                    _chai.expect(log).to.deep.equal([
                        'A: Request shared lock on \'resource\'',
                        'B: Obtain shared lock on \'resource\'',
                        'C: Request upgradable lock on \'resource\'',
                        'D: Obtain upgradable lock on \'resource\'',
                        'E: Request upgraded lock on \'resource\'',
                        'F: Request shared lock on \'resource\'',
                        'G: Unlock \'resource\'',
                        'H: Obtain upgraded lock on \'resource\'',
                        'I: Unlock \'resource\'',
                        'J: Obtain shared lock on \'resource\'',
                        'K: Unlock \'resource\''
                    ]);

                    callbackFunction();
                });
            });

            _later(55, () => {
                log.push('G: Unlock \'resource\'');
                unlock();
            });
        });
    });

    _mocha.it('should ignore when an exclusive lock is unlocked more than once', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock: firstUnlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock: secondUnlock
            }) => {
                log.push(`F: Obtain ${mode} lock on 'resource'`);

                log.push('G: Unlock \'resource\'');
                firstUnlock();

                _later(55, () => {
                    log.push('H: Unlock \'resource\'');
                    secondUnlock();
                });
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`I: Obtain ${mode} lock on 'resource'`);

                log.push('J: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request exclusive lock on \'resource\'',
                    'B: Obtain exclusive lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Unlock \'resource\'',
                    'F: Obtain exclusive lock on \'resource\'',
                    'G: Unlock \'resource\'',
                    'H: Unlock \'resource\'',
                    'I: Obtain exclusive lock on \'resource\'',
                    'J: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            log.push('E: Unlock \'resource\'');
            firstUnlock();
        });
    });

    _mocha.it('should ignore when a shared lock is unlocked more than once', callbackFunction => {
        const log = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock: firstUnlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock: secondUnlock
            }) => {
                log.push(`F: Obtain ${mode} lock on 'resource'`);

                log.push('G: Unlock \'resource\'');
                firstUnlock();

                _later(55, () => {
                    log.push('H: Unlock \'resource\'');
                    secondUnlock();
                });
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`I: Obtain ${mode} lock on 'resource'`);

                log.push('J: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Obtain shared lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Unlock \'resource\'',
                    'F: Obtain exclusive lock on \'resource\'',
                    'G: Unlock \'resource\'',
                    'H: Unlock \'resource\'',
                    'I: Obtain exclusive lock on \'resource\'',
                    'J: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            log.push('E: Unlock \'resource\'');
            firstUnlock();
        });
    });

    _mocha.it('should ignore when an upgradable lock is unlocked more than once', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock: firstUnlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock: secondUnlock
            }) => {
                log.push(`F: Obtain ${mode} lock on 'resource'`);

                log.push('G: Unlock \'resource\'');
                firstUnlock();

                _later(55, () => {
                    log.push('H: Unlock \'resource\'');
                    secondUnlock();
                });
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`I: Obtain ${mode} lock on 'resource'`);

                log.push('J: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request upgradable lock on \'resource\'',
                    'B: Obtain upgradable lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Unlock \'resource\'',
                    'F: Obtain exclusive lock on \'resource\'',
                    'G: Unlock \'resource\'',
                    'H: Unlock \'resource\'',
                    'I: Obtain exclusive lock on \'resource\'',
                    'J: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            log.push('E: Unlock \'resource\'');
            firstUnlock();
        });
    });

    _mocha.it('should allow an exclusive access request to be cancelled', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('C: Request exclusive lock on \'resource\'');
            const promise = _Mutex.exclusive({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('exclusive');

            promise.catch(error => {
                log.push('F: Exclusive lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);
            });

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                _chai.expect(unlocks.length).to.equal(2);

                unlocks.forEach(unlock => {
                    unlock();
                });

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Obtain shared lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request shared lock on \'resource\'',
                    'E: Cancel exclusive lock request',
                    'F: Exclusive lock promise rejected',
                    'G: Obtain shared lock on \'resource\''
                ]);

                callbackFunction();
            });

            _later(55, () => {
                log.push('E: Cancel exclusive lock request');
                promise.cancel();
            });
        });
    });

    _mocha.it('should allow a shared access request to be cancelled', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request shared lock on \'resource\'');
            const promise = _Mutex.shared({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('shared');

            promise.catch(error => {
                log.push('F: Shared lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('G: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);

                log.push('I: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request exclusive lock on \'resource\'',
                    'B: Obtain exclusive lock on \'resource\'',
                    'C: Request shared lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Cancel shared lock request',
                    'F: Shared lock promise rejected',
                    'G: Unlock \'resource\'',
                    'H: Obtain exclusive lock on \'resource\'',
                    'I: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            _later(55, () => {
                log.push('E: Cancel shared lock request');
                promise.cancel();
            });
        });
    });

    _mocha.it('should allow an upgradable access request to be cancelled', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgradable lock on \'resource\'');
            const promise = _Mutex.upgradable({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('upgradable');

            promise.catch(error => {
                log.push('F: Upgradable lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('G: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);

                log.push('I: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request exclusive lock on \'resource\'',
                    'B: Obtain exclusive lock on \'resource\'',
                    'C: Request upgradable lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Cancel upgradable lock request',
                    'F: Upgradable lock promise rejected',
                    'G: Unlock \'resource\'',
                    'H: Obtain exclusive lock on \'resource\'',
                    'I: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            _later(55, () => {
                log.push('E: Cancel upgradable lock request');
                promise.cancel();
            });
        });
    });

    _mocha.it('should allow an upgraded access request to be cancelled', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('C: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                log.push('E: Request upgraded lock on \'resource\'');
                const promise = upgrade();

                _chai.expect(promise).to.be.a('promise');
                _chai.expect(promise).to.have.property('cancel').that.is.a('function');
                _chai.expect(promise).to.have.property('mode').that.equals('upgraded');

                promise.catch(error => {
                    log.push('H: Upgraded lock promise rejected');
                    _chai.expect(error).to.be.an.instanceof(_Error);
                });

                log.push('F: Request shared lock on \'resource\'');
                _Mutex.shared({
                    resource: 'resource'
                }).then(({
                    mode,
                    unlock
                }) => {
                    log.push(`I: Obtain ${mode} lock on 'resource'`);
                    unlocks.push(unlock);

                    _chai.expect(unlocks.length).to.equal(3);

                    unlocks.forEach(unlock => {
                        unlock();
                    });

                    _chai.expect(log).to.deep.equal([
                        'A: Request shared lock on \'resource\'',
                        'B: Obtain shared lock on \'resource\'',
                        'C: Request upgradable lock on \'resource\'',
                        'D: Obtain upgradable lock on \'resource\'',
                        'E: Request upgraded lock on \'resource\'',
                        'F: Request shared lock on \'resource\'',
                        'G: Cancel upgraded lock request',
                        'H: Upgraded lock promise rejected',
                        'I: Obtain shared lock on \'resource\''
                    ]);

                    callbackFunction();
                });

                _later(55, () => {
                    log.push('G: Cancel upgraded lock request');
                    promise.cancel();
                });
            });
        });
    });

    _mocha.it('should ignore when an exclusive access request is cancelled after it is granted', callbackFunction => {
        const log = [
                'A: Request exclusive lock on \'resource\''
            ],
            promise = _Mutex.exclusive({
                resource: 'resource'
            });

        promise.then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Cancel exclusive lock request');
            promise.cancel();

            log.push('D: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request exclusive lock on \'resource\'',
                'B: Obtain exclusive lock on \'resource\'',
                'C: Cancel exclusive lock request',
                'D: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should ignore when a shared access request is cancelled after it is granted', callbackFunction => {
        const log = [
                'A: Request shared lock on \'resource\''
            ],
            promise = _Mutex.shared({
                resource: 'resource'
            });

        promise.then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Cancel shared lock request');
            promise.cancel();

            log.push('D: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request shared lock on \'resource\'',
                'B: Obtain shared lock on \'resource\'',
                'C: Cancel shared lock request',
                'D: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should ignore when an upgradable access request is cancelled after it is granted', callbackFunction => {
        const log = [
                'A: Request upgradable lock on \'resource\''
            ],
            promise = _Mutex.upgradable({
                resource: 'resource'
            });

        promise.then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Cancel upgradable lock request');
            promise.cancel();

            log.push('D: Unlock \'resource\'');
            unlock();

            _chai.expect(log).to.deep.equal([
                'A: Request upgradable lock on \'resource\'',
                'B: Obtain upgradable lock on \'resource\'',
                'C: Cancel upgradable lock request',
                'D: Unlock \'resource\''
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should ignore when an upgraded access request is cancelled after it is granted', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgraded lock on \'resource\'');
            const promise = upgrade();

            promise.then(({
                mode
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);

                log.push('E: Cancel upgraded lock request');
                promise.cancel();

                log.push('F: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request upgradable lock on \'resource\'',
                    'B: Obtain upgradable lock on \'resource\'',
                    'C: Request upgraded lock on \'resource\'',
                    'D: Obtain upgraded lock on \'resource\'',
                    'E: Cancel upgraded lock request',
                    'F: Unlock \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should ignore when an exclusive access request is cancelled more then once', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('C: Request exclusive lock on \'resource\'');
            const promise = _Mutex.exclusive({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('exclusive');

            promise.catch(error => {
                log.push('F: Exclusive lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);
            });

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                log.push('H: Cancel exclusive lock request');
                promise.cancel();

                _later(55, () => {
                    _chai.expect(unlocks.length).to.equal(2);

                    unlocks.forEach(unlock => {
                        unlock();
                    });

                    _chai.expect(log).to.deep.equal([
                        'A: Request shared lock on \'resource\'',
                        'B: Obtain shared lock on \'resource\'',
                        'C: Request exclusive lock on \'resource\'',
                        'D: Request shared lock on \'resource\'',
                        'E: Cancel exclusive lock request',
                        'F: Exclusive lock promise rejected',
                        'G: Obtain shared lock on \'resource\'',
                        'H: Cancel exclusive lock request'
                    ]);

                    callbackFunction();
                });
            });

            _later(55, () => {
                log.push('E: Cancel exclusive lock request');
                promise.cancel();
            });
        });
    });

    _mocha.it('should allow a shared access request to be cancelled', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request shared lock on \'resource\'');
            const promise = _Mutex.shared({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('shared');

            promise.catch(error => {
                log.push('F: Shared lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('G: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);

                log.push('I: Unlock \'resource\'');
                unlock();

                log.push('J: Cancel shared lock request');
                promise.cancel();

                _later(55, () => {
                    _chai.expect(log).to.deep.equal([
                        'A: Request exclusive lock on \'resource\'',
                        'B: Obtain exclusive lock on \'resource\'',
                        'C: Request shared lock on \'resource\'',
                        'D: Request exclusive lock on \'resource\'',
                        'E: Cancel shared lock request',
                        'F: Shared lock promise rejected',
                        'G: Unlock \'resource\'',
                        'H: Obtain exclusive lock on \'resource\'',
                        'I: Unlock \'resource\'',
                        'J: Cancel shared lock request'
                    ]);

                    callbackFunction();
                });
            });

            _later(55, () => {
                log.push('E: Cancel shared lock request');
                promise.cancel();
            });
        });
    });

    _mocha.it('should allow an upgradable access request to be cancelled', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgradable lock on \'resource\'');
            const promise = _Mutex.upgradable({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('upgradable');

            promise.catch(error => {
                log.push('F: Upgradable lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('G: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`H: Obtain ${mode} lock on 'resource'`);

                log.push('I: Unlock \'resource\'');
                unlock();

                log.push('J: Cancel upgradable lock request');
                promise.cancel();

                _later(55, () => {
                    _chai.expect(log).to.deep.equal([
                        'A: Request exclusive lock on \'resource\'',
                        'B: Obtain exclusive lock on \'resource\'',
                        'C: Request upgradable lock on \'resource\'',
                        'D: Request exclusive lock on \'resource\'',
                        'E: Cancel upgradable lock request',
                        'F: Upgradable lock promise rejected',
                        'G: Unlock \'resource\'',
                        'H: Obtain exclusive lock on \'resource\'',
                        'I: Unlock \'resource\'',
                        'J: Cancel upgradable lock request'
                    ]);
                });

                callbackFunction();
            });

            _later(55, () => {
                log.push('E: Cancel upgradable lock request');
                promise.cancel();
            });
        });
    });

    _mocha.it('should allow an upgraded access request to be cancelled', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('C: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                log.push('E: Request upgraded lock on \'resource\'');
                const promise = upgrade();

                _chai.expect(promise).to.be.a('promise');
                _chai.expect(promise).to.have.property('cancel').that.is.a('function');
                _chai.expect(promise).to.have.property('mode').that.equals('upgraded');

                promise.catch(error => {
                    log.push('H: Upgraded lock promise rejected');
                    _chai.expect(error).to.be.an.instanceof(_Error);
                });

                log.push('F: Request shared lock on \'resource\'');
                _Mutex.shared({
                    resource: 'resource'
                }).then(({
                    mode,
                    unlock
                }) => {
                    log.push(`I: Obtain ${mode} lock on 'resource'`);
                    unlocks.push(unlock);

                    log.push('J: Cancel upgraded lock request');
                    promise.cancel();

                    _later(55, () => {
                        _chai.expect(unlocks.length).to.equal(3);

                        unlocks.forEach(unlock => {
                            unlock();
                        });

                        _chai.expect(log).to.deep.equal([
                            'A: Request shared lock on \'resource\'',
                            'B: Obtain shared lock on \'resource\'',
                            'C: Request upgradable lock on \'resource\'',
                            'D: Obtain upgradable lock on \'resource\'',
                            'E: Request upgraded lock on \'resource\'',
                            'F: Request shared lock on \'resource\'',
                            'G: Cancel upgraded lock request',
                            'H: Upgraded lock promise rejected',
                            'I: Obtain shared lock on \'resource\'',
                            'J: Cancel upgraded lock request'
                        ]);

                        callbackFunction();
                    });
                });

                _later(55, () => {
                    log.push('G: Cancel upgraded lock request');
                    promise.cancel();
                });
            });
        });
    });

    _mocha.it('should allow an exclusive access request to time out', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('C: Request exclusive lock on \'resource\'');
            const promise = _Mutex.exclusive({
                resource: 'resource',
                timeout: 55
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('exclusive');

            promise.catch(error => {
                log.push('E: Exclusive lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);
            });

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`F: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                _chai.expect(unlocks.length).to.equal(2);

                unlocks.forEach(unlock => {
                    unlock();
                });

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Obtain shared lock on \'resource\'',
                    'C: Request exclusive lock on \'resource\'',
                    'D: Request shared lock on \'resource\'',
                    'E: Exclusive lock promise rejected',
                    'F: Obtain shared lock on \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should allow a shared access request to time out', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request shared lock on \'resource\'');
            const promise = _Mutex.shared({
                resource: 'resource',
                timeout: 55
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('shared');

            promise.catch(error => {
                log.push('E: Shared lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('F: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);

                log.push('H: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request exclusive lock on \'resource\'',
                    'B: Obtain exclusive lock on \'resource\'',
                    'C: Request shared lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Shared lock promise rejected',
                    'F: Unlock \'resource\'',
                    'G: Obtain exclusive lock on \'resource\'',
                    'H: Unlock \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should allow an upgradable access request to time out', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgradable lock on \'resource\'');
            const promise = _Mutex.upgradable({
                resource: 'resource',
                timeout: 55
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('upgradable');

            promise.catch(error => {
                log.push('E: Upgradable lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('F: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);

                log.push('H: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request exclusive lock on \'resource\'',
                    'B: Obtain exclusive lock on \'resource\'',
                    'C: Request upgradable lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Upgradable lock promise rejected',
                    'F: Unlock \'resource\'',
                    'G: Obtain exclusive lock on \'resource\'',
                    'H: Unlock \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should allow an upgraded access request to time out', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);

            log.push('C: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);
                unlocks.push(unlock);

                log.push('E: Request upgraded lock on \'resource\'');
                const promise = upgrade({
                    timeout: 55
                });

                _chai.expect(promise).to.be.a('promise');
                _chai.expect(promise).to.have.property('cancel').that.is.a('function');
                _chai.expect(promise).to.have.property('mode').that.equals('upgraded');

                promise.catch(error => {
                    log.push('G: Upgraded lock promise rejected');
                    _chai.expect(error).to.be.an.instanceof(_Error);
                });

                log.push('F: Request shared lock on \'resource\'');
                _Mutex.shared({
                    resource: 'resource'
                }).then(({
                    mode,
                    unlock
                }) => {
                    log.push(`H: Obtain ${mode} lock on 'resource'`);
                    unlocks.push(unlock);

                    _chai.expect(unlocks.length).to.equal(3);

                    unlocks.forEach(unlock => {
                        unlock();
                    });

                    _chai.expect(log).to.deep.equal([
                        'A: Request shared lock on \'resource\'',
                        'B: Obtain shared lock on \'resource\'',
                        'C: Request upgradable lock on \'resource\'',
                        'D: Obtain upgradable lock on \'resource\'',
                        'E: Request upgraded lock on \'resource\'',
                        'F: Request shared lock on \'resource\'',
                        'G: Upgraded lock promise rejected',
                        'H: Obtain shared lock on \'resource\''
                    ]);

                    callbackFunction();
                });
            });
        });
    });

    _mocha.it('should not time out if access is granted', callbackFunction => {
        const log = [];

        log.push('A: Request exclusive lock on \'resource\'');
        _Mutex.exclusive({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource',
                timeout: 55
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`G: Obtain ${mode} lock on 'resource'`);

                log.push('H: Unlock \'resource\'');
                unlock();
            });

            log.push('D: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource',
                timeout: 55
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`I: Obtain ${mode} lock on 'resource'`);

                _later(8, () => {
                    log.push('L: Unlock \'resource\'');
                    unlock();
                });
            });

            log.push('E: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource',
                timeout: 55
            }).then(({
                mode,
                unlock,
                upgrade
            }) => {
                log.push(`J: Obtain ${mode} lock on 'resource'`);

                log.push('K: Request upgraded lock on \'resource\'');
                upgrade({
                    timeout: 55
                }).then(({
                    mode
                }) => {
                    log.push(`M: Obtain ${mode} lock on 'resource'`);

                    log.push('N: Unlock \'resource\'');
                    unlock();

                    _chai.expect(log).to.deep.equal([
                        'A: Request exclusive lock on \'resource\'',
                        'B: Obtain exclusive lock on \'resource\'',
                        'C: Request exclusive lock on \'resource\'',
                        'D: Request shared lock on \'resource\'',
                        'E: Request upgradable lock on \'resource\'',
                        'F: Unlock \'resource\'',
                        'G: Obtain exclusive lock on \'resource\'',
                        'H: Unlock \'resource\'',
                        'I: Obtain shared lock on \'resource\'',
                        'J: Obtain upgradable lock on \'resource\'',
                        'K: Request upgraded lock on \'resource\'',
                        'L: Unlock \'resource\'',
                        'M: Obtain upgraded lock on \'resource\'',
                        'N: Unlock \'resource\''
                    ]);

                    callbackFunction();
                });
            });

            log.push('F: Unlock \'resource\'');
            unlock();
        });
    });

    _mocha.it('should prioritize exclusive access requests over shared access requests over upgradable access requests', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgradable lock on \'resource\'');
            _Mutex.upgradable({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`N: Obtain ${mode} lock on 'resource'`);

                log.push('O: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request upgradable lock on \'resource\'',
                    'B: Obtain upgradable lock on \'resource\'',
                    'C: Request upgradable lock on \'resource\'',
                    'D: Request exclusive lock on \'resource\'',
                    'E: Request shared lock on \'resource\'',
                    'F: Request shared lock on \'resource\'',
                    'G: Cancel shared lock request',
                    'H: Unlock \'resource\'',
                    'I: Shared lock promise rejected',
                    'J: Obtain exclusive lock on \'resource\'',
                    'K: Unlock \'resource\'',
                    'L: Obtain shared lock on \'resource\'',
                    'M: Unlock \'resource\'',
                    'N: Obtain upgradable lock on \'resource\'',
                    'O: Unlock \'resource\''
                ]);

                callbackFunction();
            });

            log.push('D: Request exclusive lock on \'resource\'');
            _Mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`J: Obtain ${mode} lock on 'resource'`);

                log.push('K: Unlock \'resource\'');
                unlock();
            });

            log.push('E: Request shared lock on \'resource\'');
            _Mutex.shared({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`L: Obtain ${mode} lock on 'resource'`);

                log.push('M: Unlock \'resource\'');
                unlock();
            });

            log.push('F: Request shared lock on \'resource\'');
            const promise = _Mutex.shared({
                resource: 'resource'
            });

            _chai.expect(promise).to.be.a('promise');
            _chai.expect(promise).to.have.property('cancel').that.is.a('function');
            _chai.expect(promise).to.have.property('mode').that.equals('shared');

            promise.catch(error => {
                log.push('I: Shared lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);
            });

            log.push('G: Cancel shared lock request');
            promise.cancel();

            log.push('H: Unlock \'resource\'');
            unlock();
        });
    });

    _mocha.it('should not allow upgraded access to an unlocked resource', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Unlock \'resource\'');
            unlock();

            log.push('D: Request upgraded lock on \'resource\'');
            upgrade().catch(error => {
                log.push('E: Upgraded lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                _chai.expect(log).to.deep.equal([
                    'A: Request upgradable lock on \'resource\'',
                    'B: Obtain upgradable lock on \'resource\'',
                    'C: Unlock \'resource\'',
                    'D: Request upgraded lock on \'resource\'',
                    'E: Upgraded lock promise rejected'
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should not allow upgraded access to resource while upgraded access has been granted', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgraded lock on \'resource\'');
            upgrade().then(({
                mode
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);

                log.push('E: Request upgraded lock on \'resource\'');
                upgrade().catch(error => {
                    log.push('F: Upgraded lock promise rejected');
                    _chai.expect(error).to.be.an.instanceof(_Error);

                    log.push('G: Unlock \'resource\'');
                    unlock();

                    _chai.expect(log).to.deep.equal([
                        'A: Request upgradable lock on \'resource\'',
                        'B: Obtain upgradable lock on \'resource\'',
                        'C: Request upgraded lock on \'resource\'',
                        'D: Obtain upgraded lock on \'resource\'',
                        'E: Request upgraded lock on \'resource\'',
                        'F: Upgraded lock promise rejected',
                        'G: Unlock \'resource\''
                    ]);

                    callbackFunction();
                });
            });
        });
    });

    _mocha.it('should not allow upgraded access to resource while upgraded access has been requested', callbackFunction => {
        const log = [],
            unlocks = [];

        log.push('A: Request shared lock on \'resource\'');
        _Mutex.shared({
            resource: 'resource'
        }).then(({
            mode,
            unlock
        }) => {
            log.push(`C: Obtain ${mode} lock on 'resource'`);
            unlocks.push(unlock);
        });

        log.push('B: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`D: Obtain ${mode} lock on 'resource'`);

            log.push('E: Request upgraded lock on \'resource\'');
            upgrade().then(() => {
                _chai.expect.fail('This code should never be executed');
            });

            log.push('F: Request upgraded lock on \'resource\'');
            upgrade().catch(error => {
                log.push('G: Upgraded lock promise rejected');
                _chai.expect(error).to.be.an.instanceof(_Error);

                log.push('H: Unlock \'resource\'');
                unlock();

                _chai.expect(unlocks.length).to.equal(1);

                unlocks.forEach(unlock => {
                    unlock();
                });

                _chai.expect(log).to.deep.equal([
                    'A: Request shared lock on \'resource\'',
                    'B: Request upgradable lock on \'resource\'',
                    'C: Obtain shared lock on \'resource\'',
                    'D: Obtain upgradable lock on \'resource\'',
                    'E: Request upgraded lock on \'resource\'',
                    'F: Request upgraded lock on \'resource\'',
                    'G: Upgraded lock promise rejected',
                    'H: Unlock \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should allow upgraded access more than once', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgraded lock on \'resource\'');
            upgrade().then(({
                downgrade,
                mode
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);

                log.push('E: Downgrade lock on \'resource\'');
                downgrade();

                log.push('F: Request upgraded lock on \'resource\'');
                upgrade().then(({
                    mode
                }) => {
                    log.push(`G: Obtain ${mode} lock on 'resource'`);

                    log.push('H: Unlock \'resource\'');
                    unlock();

                    _chai.expect(log).to.deep.equal([
                        'A: Request upgradable lock on \'resource\'',
                        'B: Obtain upgradable lock on \'resource\'',
                        'C: Request upgraded lock on \'resource\'',
                        'D: Obtain upgraded lock on \'resource\'',
                        'E: Downgrade lock on \'resource\'',
                        'F: Request upgraded lock on \'resource\'',
                        'G: Obtain upgraded lock on \'resource\'',
                        'H: Unlock \'resource\''
                    ]);

                    callbackFunction();
                });
            });
        });
    });

    _mocha.it('should ignore when upgraded access is downgraded more than once', callbackFunction => {
        const log = [];

        log.push('A: Request upgradable lock on \'resource\'');
        _Mutex.upgradable({
            resource: 'resource'
        }).then(({
            mode,
            unlock,
            upgrade
        }) => {
            log.push(`B: Obtain ${mode} lock on 'resource'`);

            log.push('C: Request upgraded lock on \'resource\'');
            upgrade().then(({
                downgrade,
                mode
            }) => {
                log.push(`D: Obtain ${mode} lock on 'resource'`);

                log.push('E: Downgrade lock on \'resource\'');
                downgrade();

                log.push('F: Downgrade lock on \'resource\'');
                downgrade();

                log.push('G: Unlock \'resource\'');
                unlock();

                _chai.expect(log).to.deep.equal([
                    'A: Request upgradable lock on \'resource\'',
                    'B: Obtain upgradable lock on \'resource\'',
                    'C: Request upgraded lock on \'resource\'',
                    'D: Obtain upgraded lock on \'resource\'',
                    'E: Downgrade lock on \'resource\'',
                    'F: Downgrade lock on \'resource\'',
                    'G: Unlock \'resource\''
                ]);

                callbackFunction();
            });
        });
    });

    _mocha.it('should allow exclusive access to multiple resources', callbackFunction => {
        const log = [];

        Promise.all([
            true,
            () => {
                // some function
            },
            123,
            {
                some: 'object'
            },
            'abc',
            Symbol('unique resource symbol')
        ].map(resource => {
            log.push(`Request exclusive lock on ${typeof resource} resource`);

            return _Mutex.exclusive({
                resource
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`Obtain ${mode} lock on ${typeof resource} resource`);
                return unlock;
            });
        })).then(unlocks => {
            _chai.expect(unlocks.length).to.equal(6);

            unlocks.forEach(unlock => {
                unlock();
            });

            _chai.expect(log).to.deep.equal([
                'Request exclusive lock on boolean resource',
                'Request exclusive lock on function resource',
                'Request exclusive lock on number resource',
                'Request exclusive lock on object resource',
                'Request exclusive lock on string resource',
                'Request exclusive lock on symbol resource',
                'Obtain exclusive lock on boolean resource',
                'Obtain exclusive lock on function resource',
                'Obtain exclusive lock on number resource',
                'Obtain exclusive lock on object resource',
                'Obtain exclusive lock on string resource',
                'Obtain exclusive lock on symbol resource'
            ]);

            callbackFunction();
        });
    });

    _mocha.it('should construct mutex objects', () => {
        _chai.expect(_Mutex).to.be.a('function');

        const mutex = new _Mutex();

        _chai.expect(mutex).to.be.an.instanceOf(_Mutex);
    });

    _mocha.it('should be an initializable object factory', () => {
        _chai.expect(_Mutex).to.be.a('function');

        const mutex = _Mutex();

        _chai.expect(mutex).to.be.an.instanceOf(_Mutex);
    });

    _mocha.it('should allow instances to act independenctly from each other', callbackFunction => {
        const log = [];

        Promise.all([
            _Mutex, // The static instance
            _Mutex(),
            _Mutex(),
            _Mutex()
        ].map(mutex => {
            log.push('Request exclusive lock on \'resource\'');

            return mutex.exclusive({
                resource: 'resource'
            }).then(({
                mode,
                unlock
            }) => {
                log.push(`Obtain ${mode} lock on 'resource'`);
                return unlock;
            });
        })).then(unlocks => {
            _chai.expect(unlocks.length).to.equal(4);

            unlocks.forEach(unlock => {
                unlock();
            });

            _chai.expect(log).to.deep.equal([
                'Request exclusive lock on \'resource\'',
                'Request exclusive lock on \'resource\'',
                'Request exclusive lock on \'resource\'',
                'Request exclusive lock on \'resource\'',
                'Obtain exclusive lock on \'resource\'',
                'Obtain exclusive lock on \'resource\'',
                'Obtain exclusive lock on \'resource\'',
                'Obtain exclusive lock on \'resource\''
            ]);

            callbackFunction();
        });
    });
});
