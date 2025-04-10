# isotropic-mutex

[![npm version](https://img.shields.io/npm/v/isotropic-mutex.svg)](https://www.npmjs.com/package/isotropic-mutex)
[![License](https://img.shields.io/npm/l/isotropic-mutex.svg)](https://github.com/ibi-group/isotropic-mutex/blob/main/LICENSE)
![](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A utility for in-process resource locking in JavaScript, providing advanced concurrency control for asynchronous code.

## Why Use This?

- **Controlled Concurrency**: Prevent race conditions in complex asynchronous applications
- **Multiple Lock Types**: Support for exclusive, shared, and upgradable locks
- **Promise-Based API**: Seamless integration with async/await
- **Cancellable Operations**: Cancel pending lock requests
- **Timeout Support**: Specify timeouts for lock acquisition
- **Resource Flexibility**: Lock any value (string, object, symbol, etc.)

## Installation

```bash
npm install isotropic-mutex
```

## Usage

```javascript
import _Mutex from 'isotropic-mutex';

// Basic exclusive lock
const _accessResource = async () => {
        const lock = await _Mutex.exclusive({
            resource: 'my-resource'
        });

        try {
            // Perform operations on the resource
            // No other exclusive or shared locks can be acquired during this time
            console.log('Accessing resource exclusively');

            // Simulate some work
            await someAsyncOperation();
        } finally {
            // Always release the lock when done
            lock.unlock();
        }
    },
    // Shared lock (multiple readers)
    _readResource = async () => {
        const lock = await _Mutex.shared({
            resource: 'my-resource'
        });

        try {
            // Multiple shared locks can exist simultaneously
            // But exclusive locks will be blocked
            console.log('Reading resource with shared access');

            // Simulate reading
            await readSomeData();
        } finally {
            lock.unlock();
        }
    },

    // Upgradable lock (reader that might need to write)
    _accessResourceWithPossibleUpdate = async () => {
        const lock = await _Mutex.upgradable({
            resource: 'my-resource'
        });

        try {
            // Start with read access
            console.log('Reading resource with upgradable access');

            if (needToModify()) {
                // Upgrade to exclusive access when needed
                const upgradedLock = await lock.upgrade();

                console.log('Now have exclusive access');
                await modifyResource();

                // Can downgrade back to upgradable if needed
                upgradedLock.downgrade();
            }
        } finally {
            lock.unlock();
        }
    }
```

## API

### Mutex.exclusive({ resource, timeout })

Acquires an exclusive lock on a resource. Exclusive locks prevent any other locks from being held at the same time.

#### Parameters

- `resource` (Any): The resource to lock (can be a string, object, symbol, etc.)
- `timeout` (Number, optional): Milliseconds to wait before timing out, or `null` for no timeout

#### Returns

- Promise that resolves to an object with:
  - `mode` (String): Always "exclusive"
  - `unlock` (Function): Function to release the lock

### Mutex.shared({ resource, timeout })

Acquires a shared lock on a resource. Multiple shared locks can be held simultaneously, but not with exclusive locks.

#### Parameters

- `resource` (Any): The resource to lock
- `timeout` (Number, optional): Milliseconds to wait before timing out, or `null` for no timeout

#### Returns

- Promise that resolves to an object with:
  - `mode` (String): Always "shared"
  - `unlock` (Function): Function to release the lock

### Mutex.upgradable({ resource, timeout })

Acquires an upgradable lock on a resource. Upgradable locks can coexist with shared locks and can be upgraded to exclusive.

#### Parameters

- `resource` (Any): The resource to lock
- `timeout` (Number, optional): Milliseconds to wait before timing out, or `null` for no timeout

#### Returns

- Promise that resolves to an object with:
  - `mode` (String): Always "upgradable"
  - `unlock` (Function): Function to release the lock
  - `upgrade` (Function): Function to upgrade to an exclusive lock

### upgrade({ timeout })

Upgrades an upgradable lock to an exclusive lock.

#### Parameters

- `timeout` (Number, optional): Milliseconds to wait before timing out, or `null` for no timeout

#### Returns

- Promise that resolves to an object with:
  - `mode` (String): Always "upgraded"
  - `downgrade` (Function): Function to downgrade back to an upgradable lock

### Promise.cancel()

All lock acquisition promises include a `cancel()` method that can be used to cancel a pending lock request.

## Lock Compatibility Chart

| Current Lock | Exclusive Request | Shared Request | Upgradable Request | Upgrade Request |
|--------------|------------------|----------------|-------------------|----------------|
| None         | ✅ Granted       | ✅ Granted     | ✅ Granted        | N/A            |
| Exclusive    | ⏱️ Queued        | ⏱️ Queued      | ⏱️ Queued         | N/A            |
| Shared       | ⏱️ Queued        | ✅ Granted     | ✅ Granted        | N/A            |
| Upgradable   | ⏱️ Queued        | ✅ Granted     | ⏱️ Queued         | ✅ if no shared locks<br>⏱️ Queued otherwise |
| Upgraded     | ⏱️ Queued        | ⏱️ Queued      | ⏱️ Queued         | ❌ Already upgraded |

## Examples

### Basic Lock Acquisition

```javascript
import _Mutex from 'isotropic-mutex';

const _processData = async () => {
    // Acquire an exclusive lock
    const lock = await _Mutex.exclusive({
        resource: 'database'
    });

    try {
        // Critical section - only one execution at a time
        await updateDatabase();
    } finally {
        // Always release locks
        lock.unlock();
    }
};
```

### Lock with Timeout

```javascript
import _Mutex from 'isotropic-mutex';

const _processWithTimeout = async () => {
    try {
        // Will fail if lock can't be acquired within 5 seconds
        const lock = await _Mutex.exclusive({
            resource: 'api-endpoint',
            timeout: 5000
        });

        try {
            await callApi();
        } finally {
            lock.unlock();
        }
    } catch (error) {
        console.error('Failed to acquire lock within timeout', error);
        // Handle timeout case
    }
};
```

### Cancelling a Lock Request

```javascript
import _later from 'isotropic-later';
import _Mutex from 'isotropic-mutex';

const _attemptProcessing = async () => {
    const lockPromise = _Mutex.exclusive({
            resource: 'resource'
        }),
        // Set up cancellation
        timer = _later(3000, () => {
            console.log('Cancelling lock request');
            lockPromise.cancel();
        });

    try {
        const lock = await lockPromise;

        // If we get here, we acquired the lock before cancellation

        try {
            timer.cancel();

            await doWork();
        } finally {
            lock.unlock();
        }
    } catch (error) {
        console.log('Lock was cancelled or failed', error);
    }
};
```

### Reader-Writer Pattern

```javascript
import _Mutex from 'isotropic-mutex';

// Multiple readers can access simultaneously
const _readData = async () => {
        const lock = await _Mutex.shared({
            resource: 'data'
        });

        try {
            // Multiple readers can execute this simultaneously
            return await fetchData();
        } finally {
            lock.unlock();
        }
    },
    // Writers need exclusive access
    _writeData = async newData => {
        const lock = await _Mutex.exclusive({
            resource: 'data'
        });

        try {
            // Only one writer, and no readers, can execute this at a time
            await saveData(newData);
        } finally {
            lock.unlock();
        }
    };
```

### Upgradable Lock Example

```javascript
import _Mutex from 'isotropic-mutex';

const _checkAndUpdateIfNeeded = async () => {
    // Start with an upgradable lock (compatible with shared locks)
    const lock = await _Mutex.upgradable({
        resource: 'config'
    });

    try {
        // Read the data (other readers can do this too)
        const config = await readConfig();

        if (needsUpdate(config)) {
            // Upgrade to exclusive lock to make changes
            const upgradedLock = await lock.upgrade();

            try {
                // Now we have exclusive access
                await updateConfig(config);
            } finally {
                // We can downgrade back to upgradable if needed
                upgradedLock.downgrade();
            }

            // Do more read-only operations if needed
        }
    } finally {
        lock.unlock();
    }
};
```

### Working with Multiple Resources

```javascript
import _Mutex from 'isotropic-mutex';

const _transferBetweenAccounts = async ({
    amount,
    fromId,
    toId
}) => {
    // Lock both accounts to prevent race conditions
    // (always lock in consistent order to prevent deadlocks)
    const sortedIds = [
            fromId,
            toId
        ].sort(),

        fromLock = await _Mutex.exclusive({
            resource: sortedIds[0]
        });

    try {
        const toLock = await _Mutex.exclusive({
            resource: sortedIds[1]
        });

        try {
            // Now we have exclusive access to both accounts
            await withdraw(fromId, amount);
            await deposit(toId, amount);
        } finally {
            toLock.unlock();
        }
    } finally {
        fromLock.unlock();
    }
};
```

### Creating Multiple Mutex Instances

While you can use the default instance (`Mutex`), you can also create separate instances that operate independently:

```javascript
import _Mutex from 'isotropic-mutex';

// Create separate mutex instances
const _databaseMutex = _Mutex(),
    _fileMutex = _Mutex(),
    // Use them independently
    _processData = async () =>{
        const lock = await _databaseMutex.exclusive({
            resource: 'users'
        });

        try {
            // Database operations
        } finally {
            lock.unlock();
        }
    },
    _writeFile = async () => {
        const lock = await _fileMutex.exclusive({
            resource: 'log.txt'
        });

        try {
            // File operations
        } finally {
            lock.unlock();
        }
    }
```

## Prioritization

When multiple lock requests are queued:

1. Exclusive locks have highest priority
2. Shared locks have medium priority
3. Upgradable locks have lowest priority

This prevents upgradable locks from continuously blocking exclusive requests, which could lead to starvation.

## Use Cases

- **Data Synchronization**: Coordinating access to shared data structures
- **Resource Management**: Preventing parallel access to limited resources
- **Sequential Processing**: Ensuring operations happen in a specific order
- **Critical Sections**: Protecting sections of code from concurrent execution
- **Read/Write Control**: Implementing reader-writer patterns

## Contributing

Please refer to [CONTRIBUTING.md](https://github.com/ibi-group/isotropic-mutex/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Issues

If you encounter any issues, please file them at https://github.com/ibi-group/isotropic-mutex/issues
