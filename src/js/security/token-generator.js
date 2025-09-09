export async function createWasmToken(regionX, regionY, payload) {
  try {
    // Load the Pawtect module and WASM
    const mod = await import('/_app/immutable/chunks/BBb1ALhY.js');
    let wasm;
    try {
      wasm = await mod._();
      console.log('✅ WASM initialized successfully');
    } catch (wasmError) {
      console.error('❌ WASM initialization failed:', wasmError);
      return null;
    }
    try {
      try {
        const me = await fetch(`https://backend.wplace.live/me`, { credentials: 'include' }).then(
          (r) => (r.ok ? r.json() : null)
        );
        if (me?.id) {
          mod.i(me.id);
          console.log('✅ user ID set:', me.id);
        }
      } catch {
        /* empty */
      }
    } catch (userIdError) {
      console.log('⚠️ Error setting user ID:', userIdError.message);
    }
    try {
      const testUrl = `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`;
      if (mod.r) {
        mod.r(testUrl);
        console.log('✅ Request URL set:', testUrl);
      } else {
        console.log('⚠️ request_url function (mod.r) not available');
      }
    } catch (urlError) {
      console.log('⚠️ Error setting request URL:', urlError.message);
    }

    // Create test payload
    console.log('📝 payload:', payload);

    // Encode payload
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const bodyStr = JSON.stringify(payload);
    const bytes = enc.encode(bodyStr);
    console.log('📏 Payload size:', bytes.length, 'bytes');
    console.log('📄 Payload string:', bodyStr);

    // Allocate WASM memory with validation
    let inPtr;
    try {
      if (!wasm.__wbindgen_malloc) {
        console.error('❌ __wbindgen_malloc function not found');
        return null;
      }

      inPtr = wasm.__wbindgen_malloc(bytes.length, 1);
      console.log('✅ WASM memory allocated, pointer:', inPtr);

      // Copy data to WASM memory
      const wasmBuffer = new Uint8Array(wasm.memory.buffer, inPtr, bytes.length);
      wasmBuffer.set(bytes);
      console.log('✅ Data copied to WASM memory');
    } catch (memError) {
      console.error('❌ Memory allocation error:', memError);
      return null;
    }

    // Call the WASM function
    console.log('🚀 Calling get_pawtected_endpoint_payload...');
    let outPtr, outLen, token;
    try {
      const result = wasm.get_pawtected_endpoint_payload(inPtr, bytes.length);
      console.log('✅ Function called, result type:', typeof result, result);

      if (Array.isArray(result) && result.length === 2) {
        [outPtr, outLen] = result;
        console.log('✅ Got output pointer:', outPtr, 'length:', outLen);

        // Decode the result
        const outputBuffer = new Uint8Array(wasm.memory.buffer, outPtr, outLen);
        token = dec.decode(outputBuffer);
        console.log('✅ Token decoded successfully');
      } else {
        console.error('❌ Unexpected function result format:', result);
        return null;
      }
    } catch (funcError) {
      console.error('❌ Function call error:', funcError);
      console.error('Stack trace:', funcError.stack);
      return null;
    }

    // Cleanup memory
    try {
      if (wasm.__wbindgen_free && outPtr && outLen) {
        wasm.__wbindgen_free(outPtr, outLen, 1);
        console.log('✅ Output memory freed');
      }
      if (wasm.__wbindgen_free && inPtr) {
        wasm.__wbindgen_free(inPtr, bytes.length, 1);
        console.log('✅ Input memory freed');
      }
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }

    // Display results
    console.log('');
    console.log('🎉 SUCCESS!');
    console.log('📊 Results:');
    console.log('   Input coords: [1245984, 1088]');
    console.log('   Token length:', token?.length || 0);
    console.log('   Token preview:', token?.substring(0, 50) + '...');
    console.log('');
    console.log('🔑 Full token:');
    console.log(token);
    return token;
  } catch (error) {
    console.error('❌ Failed to generate fp parameter:', error);
    return null;
  }
}
